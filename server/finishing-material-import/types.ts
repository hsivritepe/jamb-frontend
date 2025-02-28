/**
 * Shared interfaces and types for our finishing-material import logic.
 */

// This is the payload you send to your own endpoint:
// POST https://dev.thejamb.com/material/add-finishing-material
export interface FinishingMaterialPayload {
    section: number;
    external_id: string;
    name: string;
    image_href: string;
    unit_of_measurement: string;
    quantity_in_packaging: number;
    cost: number;
    work_code: string;
  }
  
  /**
   * An "ExtendedProduct" type that includes fields we know
   * may appear in the BigBox API's "product" object — specifically `specifications`.
   */
  export interface ExtendedProduct {
    item_id?: string;
    title?: string;
    link?: string;
    brand?: string;
    main_image?: {
      link: string;
      type?: string;
    };
    buybox_winner?: {
      price?: number;
      currency?: string;
      unit?: string;
    };
    // We add this field to handle "specifications":
    specifications?: Array<{
      group_name?: string;
      name?: string;
      value?: string;
    }>;
  
    // optionally other fields like variants, breadcrumbs, etc.
    // ...
  }