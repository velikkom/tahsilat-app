package com.veli.tahsilat.collection.service.impl;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
import com.veli.tahsilat.collection.dto.request.UpdateCollectionRequest;
import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.mapper.CollectionMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.collection.service.CollectionService;
import com.veli.tahsilat.collection.validation.CollectionDuplicateValidator;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionServiceImpl
        implements CollectionService {

    private final CollectionRepository collectionRepository;

    private final CustomerRepository customerRepository;

    private final CollectionMapper collectionMapper;

    private final CollectionDuplicateValidator collectionDuplicateValidator;

    private final UserRepository userRepository;

    @Override
    public CollectionResponse createCollection(
            CreateCollectionRequest request
    ) {

        Customer customer = findActiveCustomer(request.getCustomerId());

        validateMaturityDate(
                request.getPaymentType(),
                request.getMaturityDate()
        );

        collectionDuplicateValidator.assertNotDuplicate(
                request.getCustomerId(),
                request.getAmount(),
                request.getCollectionDate(),
                request.getPaymentType(),
                request.getMaturityDate()
        );

        Collection collection = new Collection();

        applyCollectionFields(
                collection,
                customer,
                request.getAmount(),
                request.getCollectionDate(),
                request.getMaturityDate(),
                request.getPaymentType(),
                request.getDescription()
        );

        collection.setReceiptNumber(request.getReceiptNumber());
        collection.setMikroSr(request.getMikroSr());
        collection.setMikroNo(request.getMikroNo());
        collection.setBankName(request.getBankName());

        // Bu versiyonda tum odeme turleri olusturuldugu anda PAID kabul edilir.
        // TODO: Cek/senet icin vade gunu odeme hesaba gectiginde PAID'e cekilecek
        // ayri bir odeme takip akisi tasarlanacak.
        collection.setStatus(CollectionStatus.PAID);
        collection.setCollectedBy(getCurrentUser());

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(
                savedCollection
        );
    }

    @Override
    public CollectionResponse getCollectionById(UUID id) {
        Collection collection = findAccessibleCollection(id);

        return collectionMapper.toResponse(collection);
    }

    @Override
    public CollectionResponse updateCollection(
            UUID id,
            UpdateCollectionRequest request
    ) {
        Collection collection = findAccessibleCollection(id);

        Customer customer = findActiveCustomer(request.getCustomerId());

        validateMaturityDate(
                request.getPaymentType(),
                request.getMaturityDate()
        );

        collectionDuplicateValidator.assertNotDuplicate(
                request.getCustomerId(),
                request.getAmount(),
                request.getCollectionDate(),
                request.getPaymentType(),
                request.getMaturityDate(),
                id
        );

        applyCollectionFields(
                collection,
                customer,
                request.getAmount(),
                request.getCollectionDate(),
                request.getMaturityDate(),
                request.getPaymentType(),
                request.getDescription()
        );

        collection.setReceiptNumber(request.getReceiptNumber());
        collection.setMikroSr(request.getMikroSr());
        collection.setMikroNo(request.getMikroNo());
        collection.setBankName(request.getBankName());

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(savedCollection);
    }

    @Override
    public void deleteCollection(UUID id) {
        Collection collection = findAccessibleCollection(id);

        collection.setActive(false);

        collectionRepository.save(collection);
    }

    @Override
    public Page<CollectionResponse> getAllCollections(Pageable pageable) {
        if (isAdmin()) {
            return collectionRepository.findByActiveTrue(pageable)
                    .map(collectionMapper::toResponse);
        }

        return collectionRepository
                .findByCollectedByIdAndActiveTrue(getCurrentUser().getId(), pageable)
                .map(collectionMapper::toResponse);
    }

    @Override
    public Page<CollectionResponse> getCollectionsByCustomerId(UUID customerId, Pageable pageable) {
        if (isAdmin()) {
            return collectionRepository.findByCustomerIdAndActiveTrue(customerId, pageable)
                    .map(collectionMapper::toResponse);
        }

        return collectionRepository.findByCustomerIdAndCollectedByIdAndActiveTrue(
                customerId,
                getCurrentUser().getId(),
                pageable
        ).map(collectionMapper::toResponse);
    }

    @Override
    public Page<CollectionResponse> getOverdueCollections(Pageable pageable) {
        if (isAdmin()) {
            return collectionRepository.findByStatusAndMaturityDateBeforeAndActiveTrue(
                    CollectionStatus.PENDING,
                    LocalDate.now(),
                    pageable
            ).map(collectionMapper::toResponse);
        }

        return collectionRepository.findByStatusAndMaturityDateBeforeAndCollectedByIdAndActiveTrue(
                CollectionStatus.PENDING,
                LocalDate.now(),
                getCurrentUser().getId(),
                pageable
        ).map(collectionMapper::toResponse);
    }

    private Collection findActiveCollection(UUID id) {
        return collectionRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Collection not found"
                                )
                );
    }

    private Collection findAccessibleCollection(UUID id) {
        Collection collection = findActiveCollection(id);
        assertCanAccessCollection(collection);
        return collection;
    }

    private void assertCanAccessCollection(Collection collection) {
        if (isAdmin()) {
            return;
        }

        User currentUser = getCurrentUser();
        User collectedBy = collection.getCollectedBy();

        if (collectedBy == null
                || !currentUser.getId().equals(collectedBy.getId())) {
            throw new ResourceNotFoundException("Collection not found");
        }
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Collection not found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Collection not found")
                );
    }

    private boolean isAdmin() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority())
                );
    }

    private Customer findActiveCustomer(UUID customerId) {
        return customerRepository
                .findByIdAndActiveTrue(customerId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Customer not found"
                                )
                );
    }

    private void validateMaturityDate(
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        boolean requiresMaturityDate =
                paymentType == PaymentType.CHECK
                        || paymentType == PaymentType.PROMISSORY_NOTE;

        if (requiresMaturityDate && maturityDate == null) {
            throw new BusinessException(
                    "Maturity date is required"
            );
        }

        if (!requiresMaturityDate && maturityDate != null) {
            throw new BusinessException(
                    "Maturity date is not allowed"
            );
        }
    }

    private void applyCollectionFields(
            Collection collection,
            Customer customer,
            java.math.BigDecimal amount,
            LocalDate collectionDate,
            LocalDate maturityDate,
            PaymentType paymentType,
            String description
    ) {
        collection.setCustomer(customer);
        collection.setAmount(amount);
        collection.setCollectionDate(collectionDate);
        collection.setMaturityDate(maturityDate);
        collection.setPaymentType(paymentType);
        collection.setDescription(description);
    }
}
