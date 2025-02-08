// Define the types for the tax rates
export interface TaxRate {
    stateCode: number; // Numeric code representing the state
    state: string; // Two-letter state code instead of full name
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
            state: "AL",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 5.24,
            combinedStateAndLocalTaxRate: 9.24
        },
        {
            stateCode: 2,
            state: "AK",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 1.81,
            combinedStateAndLocalTaxRate: 1.81
        },
        {
            stateCode: 3,
            state: "AZ",
            stateSalesTaxRate: 5.60,
            averageLocalSalesTaxRate: 2.77,
            combinedStateAndLocalTaxRate: 8.37
        },
        {
            stateCode: 4,
            state: "AR",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.94,
            combinedStateAndLocalTaxRate: 9.44
        },
        {
            stateCode: 5,
            state: "CA",
            stateSalesTaxRate: 7.25,
            averageLocalSalesTaxRate: 1.60,
            combinedStateAndLocalTaxRate: 8.85
        },
        {
            stateCode: 6,
            state: "CO",
            stateSalesTaxRate: 2.90,
            averageLocalSalesTaxRate: 4.89,
            combinedStateAndLocalTaxRate: 7.79
        },
        {
            stateCode: 7,
            state: "CT",
            stateSalesTaxRate: 6.35,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.35
        },
        {
            stateCode: 8,
            state: "DE",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 9,
            state: "FL",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 1.02,
            combinedStateAndLocalTaxRate: 7.02
        },
        {
            stateCode: 10,
            state: "GA",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 3.39,
            combinedStateAndLocalTaxRate: 7.39
        },
        {
            stateCode: 11,
            state: "HI",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 0.44,
            combinedStateAndLocalTaxRate: 4.44
        },
        {
            stateCode: 12,
            state: "ID",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.03,
            combinedStateAndLocalTaxRate: 6.03
        },
        {
            stateCode: 13,
            state: "IL",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 2.59,
            combinedStateAndLocalTaxRate: 8.84
        },
        {
            stateCode: 14,
            state: "IN",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 7.00
        },
        {
            stateCode: 15,
            state: "IA",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.93,
            combinedStateAndLocalTaxRate: 6.93
        },
        {
            stateCode: 16,
            state: "KS",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.25,
            combinedStateAndLocalTaxRate: 8.75
        },
        {
            stateCode: 17,
            state: "KY",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 18,
            state: "LA",
            stateSalesTaxRate: 4.45,
            averageLocalSalesTaxRate: 5.10,
            combinedStateAndLocalTaxRate: 9.55
        },
        {
            stateCode: 19,
            state: "ME",
            stateSalesTaxRate: 5.50,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 5.50
        },
        {
            stateCode: 20,
            state: "MD",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 21,
            state: "MA",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.25
        },
        {
            stateCode: 22,
            state: "MI",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        },
        {
            stateCode: 23,
            state: "MN",
            stateSalesTaxRate: 6.88,
            averageLocalSalesTaxRate: 0.65,
            combinedStateAndLocalTaxRate: 7.53
        },
        {
            stateCode: 24,
            state: "MS",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.07,
            combinedStateAndLocalTaxRate: 7.07
        },
        {
            stateCode: 25,
            state: "MO",
            stateSalesTaxRate: 4.23,
            averageLocalSalesTaxRate: 4.14,
            combinedStateAndLocalTaxRate: 8.37
        },
        {
            stateCode: 26,
            state: "MT",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 27,
            state: "NE",
            stateSalesTaxRate: 5.50,
            averageLocalSalesTaxRate: 1.47,
            combinedStateAndLocalTaxRate: 6.97
        },
        {
            stateCode: 28,
            state: "NV",
            stateSalesTaxRate: 6.85,
            averageLocalSalesTaxRate: 1.39,
            combinedStateAndLocalTaxRate: 8.24
        },
        {
            stateCode: 29,
            state: "NH",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 30,
            state: "NJ",
            stateSalesTaxRate: 6.63,
            averageLocalSalesTaxRate: -0.02,
            combinedStateAndLocalTaxRate: 6.61
        },
        {
            stateCode: 31,
            state: "NM",
            stateSalesTaxRate: 5.13,
            averageLocalSalesTaxRate: 2.69,
            combinedStateAndLocalTaxRate: 7.82
        },
        {
            stateCode: 32,
            state: "NY",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 4.53,
            combinedStateAndLocalTaxRate: 8.53
        },
        {
            stateCode: 33,
            state: "NC",
            stateSalesTaxRate: 4.75,
            averageLocalSalesTaxRate: 2.20,
            combinedStateAndLocalTaxRate: 6.95
        },
        {
            stateCode: 34,
            state: "ND",
            stateSalesTaxRate: 5.00,
            averageLocalSalesTaxRate: 2.04,
            combinedStateAndLocalTaxRate: 7.04
        },
        {
            stateCode: 35,
            state: "OH",
            stateSalesTaxRate: 5.75,
            averageLocalSalesTaxRate: 1.49,
            combinedStateAndLocalTaxRate: 7.24
        },
        {
            stateCode: 36,
            state: "OK",
            stateSalesTaxRate: 4.50,
            averageLocalSalesTaxRate: 4.47,
            combinedStateAndLocalTaxRate: 8.97
        },
        {
            stateCode: 37,
            state: "OR",
            stateSalesTaxRate: 0.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 0.00
        },
        {
            stateCode: 38,
            state: "PA",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.34,
            combinedStateAndLocalTaxRate: 6.34
        },
        {
            stateCode: 39,
            state: "RI",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 7.00
        },
        {
            stateCode: 40,
            state: "SC",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 1.50,
            combinedStateAndLocalTaxRate: 7.50
        },
        {
            stateCode: 41,
            state: "SD",
            stateSalesTaxRate: 4.50,
            averageLocalSalesTaxRate: 1.90,
            combinedStateAndLocalTaxRate: 6.40
        },
        {
            stateCode: 42,
            state: "TN",
            stateSalesTaxRate: 7.00,
            averageLocalSalesTaxRate: 2.55,
            combinedStateAndLocalTaxRate: 9.55
        },
        {
            stateCode: 43,
            state: "TX",
            stateSalesTaxRate: 6.25,
            averageLocalSalesTaxRate: 1.94,
            combinedStateAndLocalTaxRate: 8.19
        },
        {
            stateCode: 44,
            state: "UT",
            stateSalesTaxRate: 6.10,
            averageLocalSalesTaxRate: 1.10,
            combinedStateAndLocalTaxRate: 7.20
        },
        {
            stateCode: 45,
            state: "VT",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.36,
            combinedStateAndLocalTaxRate: 6.36
        },
        {
            stateCode: 46,
            state: "VA",
            stateSalesTaxRate: 5.30,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 5.73
        },
        {
            stateCode: 47,
            state: "WA",
            stateSalesTaxRate: 6.50,
            averageLocalSalesTaxRate: 2.90,
            combinedStateAndLocalTaxRate: 9.40
        },
        {
            stateCode: 48,
            state: "WV",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 6.43
        },
        {
            stateCode: 49,
            state: "WI",
            stateSalesTaxRate: 5.00,
            averageLocalSalesTaxRate: 0.43,
            combinedStateAndLocalTaxRate: 5.43
        },
        {
            stateCode: 50,
            state: "WY",
            stateSalesTaxRate: 4.00,
            averageLocalSalesTaxRate: 1.44,
            combinedStateAndLocalTaxRate: 5.44
        },
        {
            stateCode: 51,
            state: "DC",
            stateSalesTaxRate: 6.00,
            averageLocalSalesTaxRate: 0.00,
            combinedStateAndLocalTaxRate: 6.00
        }
    ]
};