// Define the types for the Canadian tax rates
export interface TaxRate {
    provinceCode: number; // Numeric code representing the province or territory
    province: string; // Name of the province or territory
    gst: number; // Goods and Services Tax rate
    pst: number; // Provincial Sales Tax rate
    combinedProvinceAndLocalTaxRate: number; // Combined GST and PST rate
}

// Define the root structure
export interface TaxRatesCanada {
    taxRates: TaxRate[];
}

// The data itself
export const taxRatesCanada: TaxRatesCanada = {
    taxRates: [
        {
            provinceCode: 1,
            province: "Alberta",
            gst: 5.0,
            pst: 0.0,
            combinedProvinceAndLocalTaxRate: 5.0
        },
        {
            provinceCode: 2,
            province: "British Columbia",
            gst: 5.0,
            pst: 7.0,
            combinedProvinceAndLocalTaxRate: 12.0
        },
        {
            provinceCode: 3,
            province: "Manitoba",
            gst: 5.0,
            pst: 7.0,
            combinedProvinceAndLocalTaxRate: 12.0
        },
        {
            provinceCode: 4,
            province: "New Brunswick",
            gst: 5.0,
            pst: 10.0,
            combinedProvinceAndLocalTaxRate: 15.0
        },
        {
            provinceCode: 5,
            province: "Newfoundland and Labrador",
            gst: 5.0,
            pst: 10.0,
            combinedProvinceAndLocalTaxRate: 15.0
        },
        {
            provinceCode: 6,
            province: "Nova Scotia",
            gst: 5.0,
            pst: 10.0,
            combinedProvinceAndLocalTaxRate: 15.0
        },
        {
            provinceCode: 7,
            province: "Ontario",
            gst: 5.0,
            pst: 8.0,
            combinedProvinceAndLocalTaxRate: 13.0
        },
        {
            provinceCode: 8,
            province: "Prince Edward Island",
            gst: 5.0,
            pst: 10.0,
            combinedProvinceAndLocalTaxRate: 15.0
        },
        {
            provinceCode: 9,
            province: "Quebec",
            gst: 5.0,
            pst: 9.975,
            combinedProvinceAndLocalTaxRate: 14.975
        },
        {
            provinceCode: 10,
            province: "Saskatchewan",
            gst: 5.0,
            pst: 6.0,
            combinedProvinceAndLocalTaxRate: 11.0
        },
        {
            provinceCode: 11,
            province: "Northwest Territories",
            gst: 5.0,
            pst: 0.0,
            combinedProvinceAndLocalTaxRate: 5.0
        },
        {
            provinceCode: 12,
            province: "Nunavut",
            gst: 5.0,
            pst: 0.0,
            combinedProvinceAndLocalTaxRate: 5.0
        },
        {
            provinceCode: 13,
            province: "Yukon",
            gst: 5.0,
            pst: 0.0,
            combinedProvinceAndLocalTaxRate: 5.0
        }
    ]
};