package com.veli.tahsilat.dashboard.dto.response;

import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecentCollectionsResponse {

    private List<CollectionResponse> collections;
}
