package com.veli.tahsilat.collection.service.impl;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
import com.veli.tahsilat.collection.dto.request.UpdateCollectionRequest;
import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.dto.response.DueMaturitySummaryResponse;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionServiceImpl
        implements CollectionService {

    private static final Locale TURKISH = Locale.forLanguageTag("tr-TR");

    private static final List<PaymentType> MATURITY_PAYMENT_TYPES = List.of(
            PaymentType.CHECK,
            PaymentType.PROMISSORY_NOTE
    );

    private final CollectionRepository collectionRepository;

    private final CustomerRepository customerRepository;

    private final CollectionMapper collectionMapper;

    private final CollectionDuplicateValidator collectionDuplicateValidator;

    private final UserRepository userRepository;

    @Override
    @Transactional
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
        collection.setMailOrderCompany(normalizeMailOrderCompany(request.getMailOrderCompany()));

        collection.setStatus(resolveInitialStatus(request.getPaymentType()));
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
    @Transactional
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

        CollectionStatus nextStatus = resolveStatusForUpdate(
                request.getPaymentType(),
                collection
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
        collection.setMailOrderCompany(normalizeMailOrderCompany(request.getMailOrderCompany()));
        collection.setStatus(nextStatus);

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(savedCollection);
    }

    /**
     * CHECK/PROMISSORY_NOTE settle when they are actually collected, so they start
     * PENDING. Every other payment type is settled immediately.
     */
    private CollectionStatus resolveInitialStatus(PaymentType paymentType) {
        return settlesOnCollection(paymentType)
                ? CollectionStatus.PENDING
                : CollectionStatus.PAID;
    }

    private CollectionStatus resolveStatusForUpdate(
            PaymentType nextPaymentType,
            Collection current
    ) {
        if (!settlesOnCollection(nextPaymentType)) {
            return CollectionStatus.PAID;
        }

        if (current.getPaymentType() == nextPaymentType
                && current.getStatus() == CollectionStatus.PAID) {
            return CollectionStatus.PAID;
        }

        return CollectionStatus.PENDING;
    }

    private boolean settlesOnCollection(PaymentType paymentType) {
        return paymentType == PaymentType.CHECK
                || paymentType == PaymentType.PROMISSORY_NOTE;
    }

    @Override
    @Transactional
    public CollectionResponse markCollectionAsPaid(UUID id) {
        Collection collection = findAccessibleCollection(id);

        if (collection.getStatus() == CollectionStatus.PAID) {
            throw new BusinessException("Bu tahsilat zaten tahsil edildi olarak işaretlenmiş.");
        }

        if (!settlesOnCollection(collection.getPaymentType())) {
            throw new BusinessException("Bu ödeme türü zaten tahsil edildi olarak kaydedilir.");
        }

        LocalDate maturityDate = collection.getMaturityDate();

        if (maturityDate == null || maturityDate.isAfter(LocalDate.now())) {
            throw new BusinessException("Bu tahsilat vade tarihinde tahsil edildi olarak işaretlenebilir.");
        }

        collection.setStatus(CollectionStatus.PAID);

        return collectionMapper.toResponse(collectionRepository.save(collection));
    }

    @Override
    @Transactional
    public void deleteCollection(UUID id) {
        Collection collection = findAccessibleCollection(id);

        collection.setActive(false);

        collectionRepository.save(collection);
    }

    @Override
    public Page<CollectionResponse> getAllCollections(Pageable pageable) {
        Pageable sortedPageable = applyDefaultSort(pageable);

        if (isAdmin()) {
            return collectionRepository.findByActiveTrue(sortedPageable)
                    .map(collectionMapper::toResponse);
        }

        return collectionRepository
                .findByCollectedByIdAndActiveTrue(getCurrentUser().getId(), sortedPageable)
                .map(collectionMapper::toResponse);
    }

    private Pageable applyDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }

        Sort defaultSort = Sort.by(
                Sort.Order.desc("collectionDate"),
                Sort.Order.desc("createdAt")
        );

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort);
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

    @Override
    public Page<CollectionResponse> getDueMaturityCollections(Pageable pageable) {
        LocalDate today = LocalDate.now();

        if (isAdmin()) {
            return collectionRepository
                    .findByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
                            CollectionStatus.PENDING,
                            MATURITY_PAYMENT_TYPES,
                            today,
                            pageable
                    )
                    .map(collectionMapper::toResponse);
        }

        return collectionRepository
                .findByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
                        CollectionStatus.PENDING,
                        MATURITY_PAYMENT_TYPES,
                        today,
                        getCurrentUser().getId(),
                        pageable
                )
                .map(collectionMapper::toResponse);
    }

    @Override
    public DueMaturitySummaryResponse getDueMaturitySummary() {
        LocalDate today = LocalDate.now();
        long count;
        BigDecimal amount;

        if (isAdmin()) {
            count = collectionRepository
                    .countByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
                            CollectionStatus.PENDING,
                            MATURITY_PAYMENT_TYPES,
                            today
                    );
            amount = collectionRepository
                    .sumAmountByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
                            CollectionStatus.PENDING,
                            MATURITY_PAYMENT_TYPES,
                            today
                    );
        } else {
            UUID userId = getCurrentUser().getId();
            count = collectionRepository
                    .countByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
                            CollectionStatus.PENDING,
                            MATURITY_PAYMENT_TYPES,
                            today,
                            userId
                    );
            amount = collectionRepository
                    .sumAmountByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
                            CollectionStatus.PENDING,
                            MATURITY_PAYMENT_TYPES,
                            today,
                            userId
                    );
        }

        return DueMaturitySummaryResponse.builder()
                .count(count)
                .amount(amount != null ? amount : BigDecimal.ZERO)
                .build();
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

    @Override
    @Transactional(readOnly = true)
    public List<String> listMailOrderCompanies() {
        Map<String, String> uniqueNames = new java.util.LinkedHashMap<>();

        for (String name : collectionRepository.findDistinctMailOrderCompanies()) {
            String display = normalizeMailOrderCompany(name);

            if (display == null) {
                continue;
            }

            uniqueNames.merge(
                    catalogKey(display),
                    display,
                    (existing, incoming) -> incoming.indexOf('\u0130') >= 0 ? incoming : existing
            );
        }

        return uniqueNames.values().stream()
                .sorted(Comparator.comparing(this::catalogKey))
                .toList();
    }

    private String normalizeMailOrderCompany(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase(TURKISH);
    }

    /** İ/I fold so "DeniOto" and "DENIOTO" are the same catalog entry. */
    private String catalogKey(String value) {
        return value.replace('İ', 'I');
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
