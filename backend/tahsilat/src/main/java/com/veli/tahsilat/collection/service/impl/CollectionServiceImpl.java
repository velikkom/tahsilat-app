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
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Override
    public CollectionResponse createCollection(
            CreateCollectionRequest request
    ) {

        Customer customer = findActiveCustomer(request.getCustomerId());

        validateMaturityDate(
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

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(
                savedCollection
        );
    }

    @Override
    public CollectionResponse getCollectionById(UUID id) {
        Collection collection = findActiveCollection(id);

        return collectionMapper.toResponse(collection);
    }

    @Override
    public CollectionResponse updateCollection(
            UUID id,
            UpdateCollectionRequest request
    ) {
        Collection collection = findActiveCollection(id);

        Customer customer = findActiveCustomer(request.getCustomerId());

        validateMaturityDate(
                request.getPaymentType(),
                request.getMaturityDate()
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

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(savedCollection);
    }

    @Override
    public Page<CollectionResponse> getAllCollections(Pageable pageable) {
        return collectionRepository.findByActiveTrue(pageable)
                .map(collectionMapper::toResponse);
    }

    @Override
    public Page<CollectionResponse> getCollectionsByCustomerId(UUID customerId, Pageable pageable) {
        return collectionRepository.findByCustomerIdAndActiveTrue(customerId, pageable)
                .map(collectionMapper::toResponse);
    }

    @Override
    public Page<CollectionResponse> getOverdueCollections(Pageable pageable) {
        return collectionRepository.findByStatusAndMaturityDateBeforeAndActiveTrue(
                CollectionStatus.PENDING,
                LocalDate.now(),
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
