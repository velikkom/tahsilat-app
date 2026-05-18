package com.veli.tahsilat.collection.mapper;

import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.entity.Collection;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CollectionMapper {

    @Mapping(
            target = "customerId",
            source = "customer.id"
    )

    @Mapping(
            target = "customerName",
            source = "customer.companyName"
    )

    CollectionResponse toResponse(
            Collection collection
    );
}