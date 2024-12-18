// Define the types for the tax rates
export interface TaxRate {
    stateCode: number; // Numeric code representing the state
    state: string; // Name of the state
    stateSalesTaxRate: number; // State-level sales tax rate
    averageLocalSalesTaxRate: number; // Average local sales tax rate
    combinedStateAndLocalTaxRate: number; // Combined state and local tax rate
}

// Define the root structure
export interface TaxRatesUSA {
    taxRates: TaxRate[];
}

// The data itself
export const taxRatesUSA: TaxRatesUSA = {
    taxRates: [
        {
            stateCode: 1,
            state: "Alabama",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 5.24,
            combinedStateAndLocalTaxRate: 9.24
        },
        {
            stateCode: 2,
            state: "Alaska",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 1.81,
            combinedStateAndLocalTaxRate: 1.81
        },
        {
            stateCode: 3,
            state: "Arizona",
            stateSalesTaxRate: 5.60,
            averageLocalSalesTaxRate: 2.77,
            combinedStateAndLocalTaxRate: 8.37
        },
        {
            stateCode: 4,
            state: "Arkansas",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.94,
            combinedStateAndLocalTaxRate: 9.44
        },
        {
            stateCode: 5,
            state: "California",
            stateSalesTaxRate: 7.25,
            averageLocalSalesTaxRate: 1.60,
            combinedStateAndLocalTaxRate: 8.85
        },
        {
            stateCode: 6,
            state: "Colorado",
            stateSalesTaxRate: 2.90,
            averageLocalSalesTaxRate: 4.89,
            combinedStateAndLocalTaxRate: 7.79
        },
        {
            stateCode: 7,
            state: "Connecticut",
            stateSalesTaxRate: 6.35,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.35
        },
        {
            stateCode: 8,
            state: "Delaware",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 9,
            state: "Florida",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 1.02,
            combinedStateAndLocalTaxRate: 7.02
        },
        {
            stateCode: 10,
            state: "Georgia",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 3.39,
            combinedStateAndLocalTaxRate: 7.39
        },
        {
            stateCode: 11,
            state: "Hawaii",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 0.44,
            combinedStateAndLocalTaxRate: 4.44
        },
        {
            stateCode: 12,
            state: "Idaho",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.03,
            combinedStateAndLocalTaxRate: 6.03
        },
        {
            stateCode: 13,
            state: "Illinois",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 2.59,
            combinedStateAndLocalTaxRate: 8.84
        },
        {
            stateCode: 14,
            state: "Indiana",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 7.00
        },
        {
            stateCode: 15,
            state: "Iowa",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.93,
            combinedStateAndLocalTaxRate: 6.93
        },
        {
            stateCode: 16,
            state: "Kansas",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.25,
            combinedStateAndLocalTaxRate: 8.75
        },
        {
            stateCode: 17,
            state: "Kentucky",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 18,
            state: "Louisiana",
            stateSalesTaxRate: 4.45,
            averageLocalSalesTaxRate: 5.10,
            combinedStateAndLocalTaxRate: 9.55
        },
        {
            stateCode: 19,
            state: "Maine",
            stateSalesTaxRate: 5.50,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 5.50
        },
        {
            stateCode: 20,
            state: "Maryland",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 21,
            state: "Massachusetts",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.25
        },
        {
            stateCode: 22,
            state: "Michigan",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 23,
            state: "Minnesota",
            stateSalesTaxRate: 6.88,
            averageLocalSalesTaxRate: 0.65,
            combinedStateAndLocalTaxRate: 7.53
        },
        {
            stateCode: 24,
            state: "Mississippi",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.07,
            combinedStateAndLocalTaxRate: 7.07
        },
        {
            stateCode: 25,
            state: "Missouri",
            stateSalesTaxRate: 4.23,
            averageLocalSalesTaxRate: 4.14,
            combinedStateAndLocalTaxRate: 8.37
        },
        {
            stateCode: 26,
            state: "Montana",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 27,
            state: "Nebraska",
            stateSalesTaxRate: 5.50,
            averageLocalSalesTaxRate: 1.47,
            combinedStateAndLocalTaxRate: 6.97
        },
        {
            stateCode: 28,
            state: "Nevada",
            stateSalesTaxRate: 6.85,
            averageLocalSalesTaxRate: 1.39,
            combinedStateAndLocalTaxRate: 8.24
        },
        {
            stateCode: 29,
            state: "New Hampshire",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 30,
            state: "New Jersey",
            stateSalesTaxRate: 6.63,
            averageLocalSalesTaxRate: -0.02,
            combinedStateAndLocalTaxRate: 6.61
        },
        {
            stateCode: 31,
            state: "New Mexico",
            stateSalesTaxRate: 5.13,
            averageLocalSalesTaxRate: 2.69,
            combinedStateAndLocalTaxRate: 7.82
        },
        {
            stateCode: 32,
            state: "New York",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 4.53,
            combinedStateAndLocalTaxRate: 8.53
        },
        {
            stateCode: 33,
            state: "North Carolina",
            stateSalesTaxRate: 4.75,
            averageLocalSalesTaxRate: 2.20,
            combinedStateAndLocalTaxRate: 6.95
        },
        {
            stateCode: 34,
            state: "North Dakota",
            stateSalesTaxRate: 5.00,
            averageLocalSalesTaxRate: 2.04,
            combinedStateAndLocalTaxRate: 7.04
        },
        {
            stateCode: 35,
            state: "Ohio",
            stateSalesTaxRate: 5.75,
            averageLocalSalesTaxRate: 1.49,
            combinedStateAndLocalTaxRate: 7.24
        },
        {
            stateCode: 36,
            state: "Oklahoma",
            stateSalesTaxRate: 4.50,
            averageLocalSalesTaxRate: 4.47,
            combinedStateAndLocalTaxRate: 8.97
        },
        {
            stateCode: 37,
            state: "Oregon",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 38,
            state: "Pennsylvania",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.34,
            combinedStateAndLocalTaxRate: 6.34
        },
        {
            stateCode: 39,
            state: "Rhode Island",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 7.00
        },
        {
            stateCode: 40,
            state: "South Carolina",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 1.50,
            combinedStateAndLocalTaxRate: 7.50
        },
        {
            stateCode: 41,
            state: "South Dakota",
            stateSalesTaxRate: 4.50,
            averageLocalSalesTaxRate: 1.90,
            combinedStateAndLocalTaxRate: 6.40
        },
        {
            stateCode: 42,
            state: "Tennessee",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 2.55,
            combinedStateAndLocalTaxRate: 9.55
        },
        {
            stateCode: 43,
            state: "Texas",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 1.94,
            combinedStateAndLocalTaxRate: 8.19
        },
        {
            stateCode: 44,
            state: "Utah",
            stateSalesTaxRate: 6.10,
            averageLocalSalesTaxRate: 1.10,
            combinedStateAndLocalTaxRate: 7.20
        },
        {
            stateCode: 45,
            state: "Vermont",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.36,
            combinedStateAndLocalTaxRate: 6.36
        },
        {
            stateCode: 46,
            state: "Virginia",
            stateSalesTaxRate: 5.30,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 5.73
        },
        {
            stateCode: 47,
            state: "Washington",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.90,
            combinedStateAndLocalTaxRate: 9.40
        },
        {
            stateCode: 48,
            state: "West Virginia",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 6.43
        },
        {
            stateCode: 49,
            state: "Wisconsin",
            stateSalesTaxRate: 5.00,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 5.43
        },
        {
            stateCode: 50,
            state: "Wyoming",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 1.44,
            combinedStateAndLocalTaxRate: 5.44
        },
        {
            stateCode: 51,
            state: "District of Columbia",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        }
    ]
};