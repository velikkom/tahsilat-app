package com.veli.tahsilat.trip.mapper;

import com.veli.tahsilat.trip.dto.response.TripDailyExpenseResponse;
import com.veli.tahsilat.trip.dto.response.TripResponse;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TripMapper {

    @Mapping(
            target = "salesmanId",
            source = "salesman.id"
    )
    @Mapping(
            target = "salesmanName",
            expression = "java(trip.getSalesman().getFirstName() + \" \" + trip.getSalesman().getLastName())"
    )
    TripResponse toResponse(Trip trip);

    TripDailyExpenseResponse toDailyExpenseResponse(TripDailyExpense dailyExpense);
}
