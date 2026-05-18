package com.veli.tahsilat.collection.service.impl;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
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

        Customer customer =
                customerRepository

                        .findByIdAndActiveTrue(
                                request.getCustomerId()
                        )

                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Customer not found"
                                        )
                        );

        boolean requiresMaturityDate =

                request.getPaymentType() == PaymentType.CHECK

                        ||

                        request.getPaymentType() == PaymentType.PROMISSORY_NOTE;

        if (
                requiresMaturityDate
                        &&
                        request.getMaturityDate() == null
        ) {

            throw new BusinessException(
                    "Maturity date is required"
            );
        }

        if (
                !requiresMaturityDate
                        &&
                        request.getMaturityDate() != null
        ) {

            throw new BusinessException(
                    "Maturity date is not allowed"
            );
        }

        Collection collection =
                new Collection();

        collection.setCustomer(customer);

        collection.setAmount(
                request.getAmount()
        );

        collection.setCollectionDate(
                request.getCollectionDate()
        );

        collection.setMaturityDate(
                request.getMaturityDate()
        );

        collection.setPaymentType(
                request.getPaymentType()
        );

        collection.setDescription(
                request.getDescription()
        );

        Collection savedCollection =
                collectionRepository.save(collection);

        return collectionMapper.toResponse(
                savedCollection
        );
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


}