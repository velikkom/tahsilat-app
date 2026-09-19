package com.veli.tahsilat.collection.service;

import com.veli.tahsilat.collection.dto.request.CreateCollectionRequest;
import com.veli.tahsilat.collection.dto.request.UpdateCollectionRequest;
import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.dto.response.DueMaturitySummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
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

    CollectionResponse markCollectionAsPaid(UUID id);

    void deleteCollection(UUID id);

    Page<CollectionResponse>getAllCollections(Pageable pageable);

    Page<CollectionResponse>getCollectionsByCustomerId(
            UUID customerId,
            Pageable pageable
    );

    Page<CollectionResponse> getOverdueCollections(
            Pageable pageable
    );

    Page<CollectionResponse> getDueMaturityCollections(Pageable pageable);

    DueMaturitySummaryResponse getDueMaturitySummary();

    List<String> listMailOrderCompanies();
}