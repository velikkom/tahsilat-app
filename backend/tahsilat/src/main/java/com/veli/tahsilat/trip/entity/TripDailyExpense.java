package com.veli.tahsilat.trip.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "trip_daily_expenses",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"trip_id", "expense_date"}
        )
)
public class TripDailyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "trip_id",
            nullable = false
    )
    private Trip trip;

    private LocalDate expenseDate;

    private BigDecimal mealAmount;

    private BigDecimal hotelAmount;

    private BigDecimal fuelInvoiceAmount;

    private BigDecimal otherAmount;

    private Integer eveningHotelKm;
}
