package com.veli.tahsilat.collection.service;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
import com.veli.tahsilat.collection.dto.request.UpdateCollectionRequest;
import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CollectionService {

    CollectionResponse createCollection(
            CreateCollectionRequest request
    );

    CollectionResponse getCollectionById(UUID id);

    CollectionResponse updateCollection(
            UUID id,
            UpdateCollectionRequest request
    );

    Page<CollectionResponse>getAllCollections(Pageable pageable);

    Page<CollectionResponse>getCollectionsByCustomerId(
            UUID customerId,
            Pageable pageable
    );

    Page<CollectionResponse> getOverdueCollections(
            Pageable pageable
    );
}