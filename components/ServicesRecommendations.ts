export interface RecommendedActivity {
  activity: string;
}

export interface Activity {
  activity: string;
  recommendedActivities: Record<string, RecommendedActivity>;
}

export interface Category {
  category: string;
  activities: Record<string, Activity>;
}

export interface Section {
  section: string;
  categories: Record<string, Category>;
}

export interface ServicesRecommendations {
  [key: string]: Section;
}


export const servicesRecommendations: ServicesRecommendations = {
  "1": {
    "section": "Electrical",
    "categories": {
      "1.1": {
        "category": "Smoke detector",
        "activities": {
          "1.1.1": {
            "activity": "Battery-Operated Smoke Detector Installation",
            "recommendedActivities": {
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "1.5.1": {
                "activity": "15 Amp Outlet Installation"
              },
              "15.1.1": {
                "activity": "Fire Alarm Detector Installation"
              }
            }
          },
          "1.1.2": {
            "activity": "Hardwired Smoke Detector Installation",
            "recommendedActivities": {
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "1.4.5": {
                "activity": "1-Gang Toggle Switch Installation"
              },
              "15.1.2": {
                "activity": "Carbon Monoxide Detector Installation"
              }
            }
          },
          "1.1.3": {
            "activity": "Smoke Detector Detach and Reset",
            "recommendedActivities": {
              "1.3.1": {
                "activity": "Light Fixture Removal"
              },
              "1.7.3": {
                "activity": "Chandelier Detach and Reset (up to 6 lights)"
              },
              "15.1.1": {
                "activity": "Fire Alarm Detector Installation"
              }
            }
          }
        }
      },
      "1.2": {
        "category": "Ceiling fan",
        "activities": {
          "1.2.1": {
            "activity": "Ceiling Fan Replacement",
            "recommendedActivities": {
              "1.2.2": {
                "activity": "Ceiling Fan Removal"
              },
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "10.5.1": {
                "activity": "Wet Rated Outdoor Ceiling Fan Installation"
              }
            }
          },
          "1.2.2": {
            "activity": "Ceiling Fan Removal",
            "recommendedActivities": {
              "1.3.1": {
                "activity": "Light Fixture Removal"
              },
              "1.7.3": {
                "activity": "Chandelier Detach and Reset (up to 6 lights)"
              },
              "7.4.1": {
                "activity": "Mini Split Air Conditioner Removal"
              }
            }
          }
        }
      },
      "1.3": {
        "category": "Light fixture",
        "activities": {
          "1.3.1": {
            "activity": "Light Fixture Removal",
            "recommendedActivities": {
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "1.3.3": {
                "activity": "Wall Sconce Installation"
              },
              "1.3.4": {
                "activity": "Recessed Light Installation"
              }
            }
          },
          "1.3.2": {
            "activity": "Light Fixture Installation",
            "recommendedActivities": {
              "1.3.3": {
                "activity": "Wall Sconce Installation"
              },
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "1.6.1": {
                "activity": "Dimmer Switch Installation"
              }
            }
          },
          "1.3.3": {
            "activity": "Wall Sconce Installation",
            "recommendedActivities": {
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "1.3.4": {
                "activity": "Recessed Light Installation"
              },
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              }
            }
          },
          "1.3.4": {
            "activity": "Recessed Light Installation",
            "recommendedActivities": {
              "1.4.6": {
                "activity": "2-Gang Toggle Switch Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "15.6.1": {
                "activity": "Motion Sensor for Light Fixture Installation"
              }
            }
          }
        }
      },
      "1.4": {
        "category": "Switch",
        "activities": {
          "1.4.1": {
            "activity": "Switch Replacement",
            "recommendedActivities": {
              "1.4.2": {
                "activity": "1-Gang Switch Installation"
              },
              "1.4.5": {
                "activity": "1-Gang Toggle Switch Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              }
            }
          },
          "1.4.2": {
            "activity": "1-Gang Switch Installation",
            "recommendedActivities": {
              "1.4.3": {
                "activity": "2-Gang Switch Installation"
              },
              "1.4.5": {
                "activity": "1-Gang Toggle Switch Installation"
              },
              "1.6.1": {
                "activity": "Dimmer Switch Installation"
              }
            }
          },
          "1.4.3": {
            "activity": "2-Gang Switch Installation",
            "recommendedActivities": {
              "1.4.4": {
                "activity": "3-Gang Switch Installation"
              },
              "1.4.5": {
                "activity": "1-Gang Toggle Switch Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              }
            }
          },
          "1.4.4": {
            "activity": "3-Gang Switch Installation",
            "recommendedActivities": {
              "1.4.5": {
                "activity": "1-Gang Toggle Switch Installation"
              },
              "1.4.6": {
                "activity": "2-Gang Toggle Switch Installation"
              },
              "1.6.2": {
                "activity": "Wi-Fi Dimmer Installation (Google, Alexa, HomeKit)"
              }
            }
          },
          "1.4.5": {
            "activity": "1-Gang Toggle Switch Installation",
            "recommendedActivities": {
              "1.4.6": {
                "activity": "2-Gang Toggle Switch Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              }
            }
          },
          "1.4.6": {
            "activity": "2-Gang Toggle Switch Installation",
            "recommendedActivities": {
              "1.4.7": {
                "activity": "3-Gang Toggle Switch Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              }
            }
          },
          "1.4.7": {
            "activity": "3-Gang Toggle Switch Installation",
            "recommendedActivities": {
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              }
            }
          },
          "1.4.8": {
            "activity": "Humidity Sensor Installation",
            "recommendedActivities": {
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "15.8.2": {
                "activity": "Smart Water Detector and Automatic Water Shutoff Installation"
              },
              "7.6.2": {
                "activity": "Bathroom Ventilation Fan Installation"
              }
            }
          },
          "1.4.9": {
            "activity": "Motion Sensor Installation",
            "recommendedActivities": {
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "15.6.1": {
                "activity": "Motion Sensor for Light Fixture Installation"
              },
              "24.3.1": {
                "activity": "Motion-Sensing Security Alarm Installation"
              }
            }
          }
        }
      },
      "1.5": {
        "category": "Outlet",
        "activities": {
          "1.5.1": {
            "activity": "15 Amp Outlet Installation",
            "recommendedActivities": {
              "1.5.2": {
                "activity": "30 Amp Outlet Installation"
              },
              "1.5.3": {
                "activity": "50 Amp Outlet Installation"
              },
              "1.5.4": {
                "activity": "Phone, TV, or Speaker Outlet Installation"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "10.2.5": {
                "activity": "Running Power Cable for Installing a Power Pedestal"
              }
            }
          },
          "1.5.2": {
            "activity": "30 Amp Outlet Installation",
            "recommendedActivities": {
              "1.5.3": {
                "activity": "50 Amp Outlet Installation"
              },
              "1.5.4": {
                "activity": "Phone, TV, or Speaker Outlet Installation"
              },
              "1.5.5": {
                "activity": "Floor Outlet Installation"
              },
              "10.2.4": {
                "activity": "Power Pedestal for RV Installation"
              },
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              }
            }
          },
          "1.5.3": {
            "activity": "50 Amp Outlet Installation",
            "recommendedActivities": {
              "1.5.4": {
                "activity": "Phone, TV, or Speaker Outlet Installation"
              },
              "1.5.5": {
                "activity": "Floor Outlet Installation"
              },
              "10.3.1": {
                "activity": "EV Charger Installation"
              },
              "10.2.4": {
                "activity": "Power Pedestal for RV Installation"
              }
            }
          },
          "1.5.4": {
            "activity": "Phone, TV, or Speaker Outlet Installation",
            "recommendedActivities": {
              "1.5.5": {
                "activity": "Floor Outlet Installation"
              },
              "10.6.1": {
                "activity": "Outdoor Home Theater Installation"
              },
              "10.2.3": {
                "activity": "Backyard Outlet with Switch Installation"
              }
            }
          },
          "1.5.5": {
            "activity": "Floor Outlet Installation",
            "recommendedActivities": {
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              }
            }
          }
        }
      },
      "1.6": {
        "category": "Dimmer Switch",
        "activities": {
          "1.6.1": {
            "activity": "Dimmer Switch Installation",
            "recommendedActivities": {
              "1.6.2": {
                "activity": "Wi-Fi Dimmer Installation (Google, Alexa, HomeKit)"
              },
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "18.2.1": {
                "activity": "String Light Kit Installation"
              }
            }
          },
          "1.6.2": {
            "activity": "Wi-Fi Dimmer Installation (Google, Alexa, HomeKit)",
            "recommendedActivities": {
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              }
            }
          },
          "1.6.3": {
            "activity": "Wi-Fi Motion Sensor Dimmer Installation",
            "recommendedActivities": {
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              },
              "1.4.8": {
                "activity": "Humidity Sensor Installation"
              },
              "18.6.2": {
                "activity": "Smart Outdoor Lighting System Installation (15 lights)"
              }
            }
          },
          "1.6.4": {
            "activity": "Countdown Timer Installation",
            "recommendedActivities": {
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "1.5.1": {
                "activity": "15 Amp Outlet Installation"
              },
              "15.6.1": {
                "activity": "Motion Sensor for Light Fixture Installation"
              }
            }
          }
        }
      },
      "1.7": {
        "category": "Chandelier",
        "activities": {
          "1.7.1": {
            "activity": "Chandelier Installation",
            "recommendedActivities": {
              "1.7.2": {
                "activity": "Crystal Chandelier Installation"
              },
              "1.7.3": {
                "activity": "Chandelier Detach and Reset (up to 6 lights)"
              },
              "1.7.4": {
                "activity": "Chandelier Detach and Reset (more than 6 lights)"
              },
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "7.4.6": {
                "activity": "Mini Split Air Conditioner Routine Maintenance"
              }
            }
          },
          "1.7.2": {
            "activity": "Crystal Chandelier Installation",
            "recommendedActivities": {
              "1.7.3": {
                "activity": "Chandelier Detach and Reset (up to 6 lights)"
              },
              "1.7.4": {
                "activity": "Chandelier Detach and Reset (more than 6 lights)"
              },
              "1.3.3": {
                "activity": "Wall Sconce Installation"
              },
              "7.4.7": {
                "activity": "Mini Split Air Conditioner Refrigerant Management"
              }
            }
          },
          "1.7.3": {
            "activity": "Chandelier Detach and Reset (up to 6 lights)",
            "recommendedActivities": {
              "1.7.4": {
                "activity": "Chandelier Detach and Reset (more than 6 lights)"
              },
              "1.3.4": {
                "activity": "Recessed Light Installation"
              },
              "7.4.5": {
                "activity": "Mini Split Air Conditioner Diagnostics and Troubleshooting"
              }
            }
          },
          "1.7.4": {
            "activity": "Chandelier Detach and Reset (more than 6 lights)",
            "recommendedActivities": {
              "1.3.1": {
                "activity": "Light Fixture Removal"
              },
              "1.6.3": {
                "activity": "Wi-Fi Motion Sensor Dimmer Installation"
              }
            }
          }
        }
      },
      "1.8": {
        "category": "Wiring",
        "activities": {
          "1.8.1": {
            "activity": "Wiring with PVC Conduit Installation",
            "recommendedActivities": {
              "1.8.2": {
                "activity": "Wiring Installation (no conduits)"
              },
              "1.8.3": {
                "activity": "Wiring with Metal Conduit Installation"
              },
              "1.6.4": {
                "activity": "Countdown Timer Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              }
            }
          },
          "1.8.2": {
            "activity": "Wiring Installation (no conduits)",
            "recommendedActivities": {
              "1.8.3": {
                "activity": "Wiring with Metal Conduit Installation"
              },
              "1.5.5": {
                "activity": "Floor Outlet Installation"
              },
              "10.6.1": {
                "activity": "Outdoor Home Theater Installation"
              }
            }
          },
          "1.8.3": {
            "activity": "Wiring with Metal Conduit Installation",
            "recommendedActivities": {
              "1.4.1": {
                "activity": "Switch Replacement"
              },
              "1.5.4": {
                "activity": "Phone, TV, or Speaker Outlet Installation"
              }
            }
          }
        }
      },
      "1.9": {
        "category": "Troubleshooting",
        "activities": {
          "1.9.1": {
            "activity": "Circuit Breaker and Fuse Troubleshooting",
            "recommendedActivities": {
              "1.9.2": {
                "activity": "Faulty Wiring and Connection Troubleshooting"
              },
              "1.9.3": {
                "activity": "Lighting and Fixture Troubleshooting"
              },
              "1.9.4": {
                "activity": "Outlet and Switch Malfunction Troubleshooting"
              },
              "10.8.1": {
                "activity": "Comprehensive System Evaluation"
              },
              "10.8.2": {
                "activity": "Electrical Panel and Circuit Breakers Inspection"
              }
            }
          },
          "1.9.2": {
            "activity": "Faulty Wiring and Connection Troubleshooting",
            "recommendedActivities": {
              "1.9.3": {
                "activity": "Lighting and Fixture Troubleshooting"
              },
              "1.9.4": {
                "activity": "Outlet and Switch Malfunction Troubleshooting"
              },
              "10.8.3": {
                "activity": "Outdoor Electrical Seasonal Preparation"
              }
            }
          },
          "1.9.3": {
            "activity": "Lighting and Fixture Troubleshooting",
            "recommendedActivities": {
              "1.9.4": {
                "activity": "Outlet and Switch Malfunction Troubleshooting"
              },
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "1.4.1": {
                "activity": "Switch Replacement"
              }
            }
          },
          "1.9.4": {
            "activity": "Outlet and Switch Malfunction Troubleshooting",
            "recommendedActivities": {
              "1.5.1": {
                "activity": "15 Amp Outlet Installation"
              },
              "1.4.9": {
                "activity": "Motion Sensor Installation"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              }
            }
          }
        }
      },
      "1.10": {
        "category": "Track Lighting",
        "activities": {
          "1.10.1": {
            "activity": "Track Lighting Kit Installation",
            "recommendedActivities": {
              "1.10.2": {
                "activity": "Fixed Track Lighting Installation"
              },
              "1.3.2": {
                "activity": "Light Fixture Installation"
              },
              "1.4.1": {
                "activity": "Switch Replacement"
              }
            }
          },
          "1.10.2": {
            "activity": "Fixed Track Lighting Installation",
            "recommendedActivities": {
              "1.4.2": {
                "activity": "1-Gang Switch Installation"
              },
              "1.6.1": {
                "activity": "Dimmer Switch Installation"
              }
            }
          }
        }
      }
    }
  },
  "2": {
    "section": "Plumbing",
    "categories": {
      "2.1": {
        "category": "Toilet",
        "activities": {
          "2.1.1": {
            "activity": "Toilet Supply and Installation",
            "recommendedActivities": {
              "2.1.2": {
                "activity": "Flange and Wax Ring Replacement"
              },
              "2.1.3": {
                "activity": "Tank Flapper Replacement"
              },
              "2.1.4": {
                "activity": "Flush Mechanism Repair"
              },
              "2.1.5": {
                "activity": "Manual Diaphragm Flush Valve Replacement"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              }
            }
          },
          "2.1.2": {
            "activity": "Flange and Wax Ring Replacement",
            "recommendedActivities": {
              "2.1.3": {
                "activity": "Tank Flapper Replacement"
              },
              "2.1.4": {
                "activity": "Flush Mechanism Repair"
              },
              "2.1.5": {
                "activity": "Manual Diaphragm Flush Valve Replacement"
              },
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "2.1.3": {
            "activity": "Tank Flapper Replacement",
            "recommendedActivities": {
              "2.1.4": {
                "activity": "Flush Mechanism Repair"
              },
              "2.1.5": {
                "activity": "Manual Diaphragm Flush Valve Replacement"
              },
              "2.1.6": {
                "activity": "Urinal Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.5.2": {
                "activity": "Waterproofing and Tile Shower Installation (up to 60 SF)"
              }
            }
          },
          "2.1.4": {
            "activity": "Flush Mechanism Repair",
            "recommendedActivities": {
              "2.1.5": {
                "activity": "Manual Diaphragm Flush Valve Replacement"
              },
              "2.1.6": {
                "activity": "Urinal Installation"
              },
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          },
          "2.1.5": {
            "activity": "Manual Diaphragm Flush Valve Replacement",
            "recommendedActivities": {
              "2.1.6": {
                "activity": "Urinal Installation"
              },
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "2.1.8": {
                "activity": "Electric Bidet Seat Installation"
              },
              "4.3.4": {
                "activity": "Natural Stone Threshold Installation"
              },
              "4.3.5": {
                "activity": "Natural Stone Countertop Installation"
              }
            }
          },
          "2.1.6": {
            "activity": "Urinal Installation",
            "recommendedActivities": {
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "2.1.8": {
                "activity": "Electric Bidet Seat Installation"
              },
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.5.4": {
                "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)"
              }
            }
          },
          "2.1.7": {
            "activity": "Smart Toilet Bidet Installation",
            "recommendedActivities": {
              "2.1.8": {
                "activity": "Electric Bidet Seat Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              }
            }
          },
          "2.1.8": {
            "activity": "Electric Bidet Seat Installation",
            "recommendedActivities": {
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "2.4.6": {
                "activity": "Undermount Kitchen Sink Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "5.3.2": {
                "activity": "Vinyl tile Installation"
              },
              "5.3.3": {
                "activity": "Self-Adhesive Vinyl Tile Installation"
              }
            }
          }
        }
      },
      "2.2": {
        "category": "Shower",
        "activities": {
          "2.2.1": {
            "activity": "Faucet Replacement",
            "recommendedActivities": {
              "2.2.2": {
                "activity": "Rectangular Tub/Shower Combo Installation"
              },
              "2.2.3": {
                "activity": "Shower Base Replacement"
              },
              "2.2.4": {
                "activity": "Shower Walls Replacement"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          },
          "2.2.2": {
            "activity": "Rectangular Tub/Shower Combo Installation",
            "recommendedActivities": {
              "2.2.3": {
                "activity": "Shower Base Replacement"
              },
              "2.2.4": {
                "activity": "Shower Walls Replacement"
              },
              "2.2.5": {
                "activity": "Sliding Shower Door Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          },
          "2.2.3": {
            "activity": "Shower Base Replacement",
            "recommendedActivities": {
              "2.2.4": {
                "activity": "Shower Walls Replacement"
              },
              "2.2.5": {
                "activity": "Sliding Shower Door Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              }
            }
          },
          "2.2.4": {
            "activity": "Shower Walls Replacement",
            "recommendedActivities": {
              "2.2.5": {
                "activity": "Sliding Shower Door Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.8.6": {
                "activity": "Cement board Installation"
              }
            }
          },
          "2.2.5": {
            "activity": "Sliding Shower Door Installation",
            "recommendedActivities": {
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              }
            }
          }
        }
      },
      "2.3": {
        "category": "Bathtub",
        "activities": {
          "2.3.1": {
            "activity": "Freestanding Bathtub and Faucet Installation",
            "recommendedActivities": {
              "2.3.2": {
                "activity": "Alcove Bathtub Installation"
              },
              "2.3.3": {
                "activity": "Tub Surrounds Installation"
              },
              "2.3.4": {
                "activity": "Sliding Bathtub Door Installation"
              },
              "4.5.4": {
                "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              }
            }
          },
          "2.3.2": {
            "activity": "Alcove Bathtub Installation",
            "recommendedActivities": {
              "2.3.3": {
                "activity": "Tub Surrounds Installation"
              },
              "2.3.4": {
                "activity": "Sliding Bathtub Door Installation"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              }
            }
          },
          "2.3.3": {
            "activity": "Tub Surrounds Installation",
            "recommendedActivities": {
              "2.3.4": {
                "activity": "Sliding Bathtub Door Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.7.1": {
                "activity": "Fireplace Hearth Tile Installation"
              }
            }
          },
          "2.3.4": {
            "activity": "Sliding Bathtub Door Installation",
            "recommendedActivities": {
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              }
            }
          }
        }
      },
      "2.4": {
        "category": "Sink",
        "activities": {
          "2.4.1": {
            "activity": "Vessel Sink Installation",
            "recommendedActivities": {
              "2.4.2": {
                "activity": "Undermount Sink Installation"
              },
              "2.4.3": {
                "activity": "Pedestal Sink Installation"
              },
              "2.4.4": {
                "activity": "Wall Mount Sink Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "4.3.7": {
                "activity": "Cut for sink opening in natural marble"
              }
            }
          },
          "2.4.2": {
            "activity": "Undermount Sink Installation",
            "recommendedActivities": {
              "2.4.3": {
                "activity": "Pedestal Sink Installation"
              },
              "2.4.4": {
                "activity": "Wall Mount Sink Installation"
              },
              "2.4.5": {
                "activity": "Old Sink Removal"
              },
              "4.3.4": {
                "activity": "Natural Stone Threshold Installation"
              }
            }
          },
          "2.4.3": {
            "activity": "Pedestal Sink Installation",
            "recommendedActivities": {
              "2.4.4": {
                "activity": "Wall Mount Sink Installation"
              },
              "2.4.5": {
                "activity": "Old Sink Removal"
              },
              "2.4.6": {
                "activity": "Undermount Kitchen Sink Installation"
              },
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              }
            }
          },
          "2.4.4": {
            "activity": "Wall Mount Sink Installation",
            "recommendedActivities": {
              "2.4.5": {
                "activity": "Old Sink Removal"
              },
              "2.4.6": {
                "activity": "Undermount Kitchen Sink Installation"
              },
              "2.4.7": {
                "activity": "Double Basin Sink Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              }
            }
          },
          "2.4.5": {
            "activity": "Old Sink Removal",
            "recommendedActivities": {
              "2.4.6": {
                "activity": "Undermount Kitchen Sink Installation"
              },
              "2.4.7": {
                "activity": "Double Basin Sink Installation"
              },
              "5.3.1": {
                "activity": "Vinyl Tile Removal"
              },
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              }
            }
          },
          "2.4.6": {
            "activity": "Undermount Kitchen Sink Installation",
            "recommendedActivities": {
              "2.4.7": {
                "activity": "Double Basin Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.1.3": {
                "activity": "Ceramic Tile Repair"
              }
            }
          },
          "2.4.7": {
            "activity": "Double Basin Sink Installation",
            "recommendedActivities": {
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.3.7": {
                "activity": "Cut for sink opening in natural marble"
              }
            }
          }
        }
      },
      "2.5": {
        "category": "Faucet",
        "activities": {
          "2.5.1": {
            "activity": "Vessel Sink Faucet Installation",
            "recommendedActivities": {
              "2.4.1": {
                "activity": "Vessel Sink Installation"
              },
              "4.3.7": {
                "activity": "Cut for sink opening in natural marble"
              },
              "4.3.4": {
                "activity": "Natural Stone Threshold Installation"
              }
            }
          },
          "2.5.2": {
            "activity": "Undermount Sink Faucet Installation",
            "recommendedActivities": {
              "2.4.2": {
                "activity": "Undermount Sink Installation"
              },
              "2.4.6": {
                "activity": "Undermount Kitchen Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              }
            }
          },
          "2.5.3": {
            "activity": "Pedestal Sink Faucet Installation",
            "recommendedActivities": {
              "2.4.3": {
                "activity": "Pedestal Sink Installation"
              },
              "2.5.4": {
                "activity": "Single Hole Faucet Installation"
              },
              "4.3.5": {
                "activity": "Natural Stone Sill Installation"
              }
            }
          },
          "2.5.4": {
            "activity": "Single Hole Faucet Installation",
            "recommendedActivities": {
              "2.5.3": {
                "activity": "Pedestal Sink Faucet Installation"
              },
              "2.5.5": {
                "activity": "Kitchen Faucet Installation"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              }
            }
          },
          "2.5.5": {
            "activity": "Kitchen Faucet Installation",
            "recommendedActivities": {
              "2.5.6": {
                "activity": "Wall Mounted Potfiller Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.3.3": {
                "activity": "Countertop Restoration"
              }
            }
          },
          "2.5.6": {
            "activity": "Wall Mounted Potfiller Installation",
            "recommendedActivities": {
              "2.5.5": {
                "activity": "Kitchen Faucet Installation"
              },
              "4.3.7": {
                "activity": "Cut for sink opening in natural marble"
              },
              "4.6.4": {
                "activity": "Solid Surface Countertop Installation"
              }
            }
          },
          "2.5.7": {
            "activity": "Bidet Sprayer Installation",
            "recommendedActivities": {
              "2.1.7": {
                "activity": "Smart Toilet Bidet Installation"
              },
              "2.1.8": {
                "activity": "Electric Bidet Seat Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          }
        }
      },
      "2.6": {
        "category": "Water Heater",
        "activities": {
          "2.6.1": {
            "activity": "Gas Water Heater Installation",
            "recommendedActivities": {
              "2.6.3": {
                "activity": "Old Water Heater Removal"
              },
              "10.7.1": {
                "activity": "Whole House Propane/Natural Gas Generator Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              }
            }
          },
          "2.6.2": {
            "activity": "Electric Water Heater Installation",
            "recommendedActivities": {
              "2.6.3": {
                "activity": "Old Water Heater Removal"
              },
              "10.7.2": {
                "activity": "Whole House Generator Maintenance"
              },
              "7.9.3": {
                "activity": "Electric Wall Heater Installation"
              }
            }
          },
          "2.6.3": {
            "activity": "Old Water Heater Removal",
            "recommendedActivities": {
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              },
              "2.6.4": {
                "activity": "Electric Tankless Water Heater Installation"
              },
              "4.8.1": {
                "activity": "Waterproofing and Tile Shower Installation"
              }
            }
          },
          "2.6.4": {
            "activity": "Electric Tankless Water Heater Installation",
            "recommendedActivities": {
              "7.10.3": {
                "activity": "Air Purifier Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          }
        }
      },
      "2.7": {
        "category": "Garbage Disposal",
        "activities": {
          "2.7.1": {
            "activity": "Garbage Disposal Installation",
            "recommendedActivities": {
              "2.8.2": {
                "activity": "Clog Clearing"
              },
              "2.9.3": {
                "activity": "3/4 inch Pipe Emergency Repair"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              }
            }
          },
          "2.7.2": {
            "activity": "Garbage Disposal Removal",
            "recommendedActivities": {
              "2.8.2": {
                "activity": "Clog Clearing"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              },
              "14.3.1": {
                "activity": "Dishwasher Removal"
              }
            }
          }
        }
      },
      "2.8": {
        "category": "Clogged Drain",
        "activities": {
          "2.8.1": {
            "activity": "Drain Line Camera Inspection",
            "recommendedActivities": {
              "2.8.2": {
                "activity": "Clog Clearing"
              },
              "2.9.1": {
                "activity": "PEX Rough-In Plumbing per Fixture"
              },
              "2.9.2": {
                "activity": "Floor/Laundry Pan Drain Rough-In Plumbing"
              }
            }
          },
          "2.8.2": {
            "activity": "Clog Clearing",
            "recommendedActivities": {
              "2.8.1": {
                "activity": "Drain Line Camera Inspection"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          }
        }
      },
      "2.9": {
        "category": "Pipes",
        "activities": {
          "2.9.1": {
            "activity": "PEX Rough-In Plumbing per Fixture",
            "recommendedActivities": {
              "2.9.2": {
                "activity": "Floor/Laundry Pan Drain Rough-In Plumbing"
              },
              "2.9.3": {
                "activity": "3/4 inch Pipe Emergency Repair"
              },
              "2.9.4": {
                "activity": "\u00bd inch Pipe Emergency Repair"
              }
            }
          },
          "2.9.2": {
            "activity": "Floor/Laundry Pan Drain Rough-In Plumbing",
            "recommendedActivities": {
              "2.9.1": {
                "activity": "PEX Rough-In Plumbing per Fixture"
              },
              "2.8.1": {
                "activity": "Drain Line Camera Inspection"
              },
              "2.9.3": {
                "activity": "3/4 inch Pipe Emergency Repair"
              }
            }
          },
          "2.9.3": {
            "activity": "3/4 inch Pipe Emergency Repair",
            "recommendedActivities": {
              "2.9.4": {
                "activity": "\u00bd inch Pipe Emergency Repair"
              },
              "2.8.2": {
                "activity": "Clog Clearing"
              },
              "2.9.2": {
                "activity": "Floor/Laundry Pan Drain Rough-In Plumbing"
              }
            }
          },
          "2.9.4": {
            "activity": "\u00bd inch Pipe Emergency Repair",
            "recommendedActivities": {
              "2.9.3": {
                "activity": "3/4 inch Pipe Emergency Repair"
              },
              "2.8.1": {
                "activity": "Drain Line Camera Inspection"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              }
            }
          }
        }
      }
    }
  },
  "3": {
    "section": "Painting",
    "categories": {
      "3.1": {
        "category": "Walls",
        "activities": {
          "3.1.1": {
            "activity": "White Wall Painting (Two Coats)",
            "recommendedActivities": {
              "3.1.2": {
                "activity": "Wall Painting Refresh (One Coat)"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.2.1": {
                "activity": "Ceiling Painting: Seal, Prime, and Paint"
              }
            }
          },
          "3.1.2": {
            "activity": "Wall Painting Refresh (One Coat)",
            "recommendedActivities": {
              "3.1.1": {
                "activity": "White Wall Painting (Two Coats)"
              },
              "3.2.2": {
                "activity": "One Coat Refresh Ceiling Painting"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              }
            }
          },
          "3.1.3": {
            "activity": "Color Wall Painting (Two Coats)",
            "recommendedActivities": {
              "3.1.1": {
                "activity": "White Wall Painting (Two Coats)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.5.3": {
                "activity": "Color Door Painting (One Side)"
              }
            }
          },
          "3.1.4": {
            "activity": "Bathroom Wall Painting (White)",
            "recommendedActivities": {
              "3.1.5": {
                "activity": "Bathroom Wall Painting (Color)"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "4.5.2": {
                "activity": "Waterproofing and Tile Shower Installation (up to 60 SF)"
              }
            }
          },
          "3.1.5": {
            "activity": "Bathroom Wall Painting (Color)",
            "recommendedActivities": {
              "3.1.4": {
                "activity": "Bathroom Wall Painting (White)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          },
          "3.1.6": {
            "activity": "Concrete and Masonry Wall Painting",
            "recommendedActivities": {
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "4.3.3": {
                "activity": "Natural Stone Tile Installation"
              },
              "3.9.3": {
                "activity": "Mold Removal and Wall Protection"
              }
            }
          },
          "3.1.7": {
            "activity": "Wall Staining and Finishing",
            "recommendedActivities": {
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              },
              "4.3.5": {
                "activity": "Natural Stone Threshold Installation"
              }
            }
          }
        }
      },
      "3.2": {
        "category": "Ceilings",
        "activities": {
          "3.2.1": {
            "activity": "Ceiling Painting: Seal, Prime, and Paint",
            "recommendedActivities": {
              "3.2.2": {
                "activity": "One Coat Refresh Ceiling Painting"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.3.1": {
                "activity": "Popcorn Ceiling Removal"
              }
            }
          },
          "3.2.2": {
            "activity": "One Coat Refresh Ceiling Painting",
            "recommendedActivities": {
              "3.2.1": {
                "activity": "Ceiling Painting: Seal, Prime, and Paint"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.5.1": {
                "activity": "White Door Painting (One Side)"
              }
            }
          }
        }
      },
      "3.3": {
        "category": "Acoustic Ceiling",
        "activities": {
          "3.3.1": {
            "activity": "Popcorn Ceiling Removal",
            "recommendedActivities": {
              "3.3.2": {
                "activity": "Popcorn Ceiling Installation"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              },
              "3.2.1": {
                "activity": "Ceiling Painting: Seal, Prime, and Paint"
              }
            }
          },
          "3.3.2": {
            "activity": "Popcorn Ceiling Installation",
            "recommendedActivities": {
              "3.3.1": {
                "activity": "Popcorn Ceiling Removal"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.5.2": {
                "activity": "White Door Painting (Two Sides, Jamb, and Trim)"
              }
            }
          }
        }
      },
      "3.4": {
        "category": "Trim and Molding",
        "activities": {
          "3.4.1": {
            "activity": "White Trim and Molding Painting (One Coat Refresh)",
            "recommendedActivities": {
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.2.1": {
                "activity": "Ceiling Painting: Seal, Prime, and Paint"
              },
              "3.1.2": {
                "activity": "Wall Painting Refresh (One Coat)"
              }
            }
          },
          "3.4.2": {
            "activity": "Color Trim and Molding Painting (Two Coats)",
            "recommendedActivities": {
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.1.3": {
                "activity": "Color Wall Painting (Two Coats)"
              },
              "3.5.3": {
                "activity": "Color Door Painting (One Side)"
              }
            }
          },
          "3.4.3": {
            "activity": "Trim and Molding Staining and Finishing",
            "recommendedActivities": {
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.1.7": {
                "activity": "Wall Staining and Finishing"
              },
              "3.3.1": {
                "activity": "Popcorn Ceiling Removal"
              }
            }
          }
        }
      },
      "3.5": {
        "category": "Doors",
        "activities": {
          "3.5.1": {
            "activity": "White Door Painting (One Side)",
            "recommendedActivities": {
              "3.5.2": {
                "activity": "White Door Painting (Two Sides, Jamb, and Trim)"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.6.1": {
                "activity": "White Window Painting (One Side)"
              }
            }
          },
          "3.5.2": {
            "activity": "White Door Painting (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.5.1": {
                "activity": "White Door Painting (One Side)"
              },
              "3.6.2": {
                "activity": "White Window Painting (Two Sides, Jamb, and Trim)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "3.5.3": {
            "activity": "Color Door Painting (One Side)",
            "recommendedActivities": {
              "3.5.4": {
                "activity": "Color Door Painting (Two Sides, Jamb, and Trim)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.6.3": {
                "activity": "Color Window Painting (One Side)"
              }
            }
          },
          "3.5.4": {
            "activity": "Color Door Painting (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.5.3": {
                "activity": "Color Door Painting (One Side)"
              },
              "3.6.4": {
                "activity": "Color Window Painting (Two Sides, Jamb, and Trim)"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          },
          "3.5.5": {
            "activity": "Door Staining and Finishing (One Side, Jamb, and Trim)",
            "recommendedActivities": {
              "3.5.6": {
                "activity": "Door Staining and Finishing (Two Sides, Jamb, and Trim)"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              },
              "3.6.5": {
                "activity": "Window Staining and Finishing (One Side, Jamb, and Trim)"
              }
            }
          },
          "3.5.6": {
            "activity": "Door Staining and Finishing (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.5.5": {
                "activity": "Door Staining and Finishing (One Side, Jamb, and Trim)"
              },
              "3.6.6": {
                "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          }
        }
      },
      "3.6": {
        "category": "Windows",
        "activities": {
          "3.6.1": {
            "activity": "White Window Painting (One Side)",
            "recommendedActivities": {
              "3.6.2": {
                "activity": "White Window Painting (Two Sides, Jamb, and Trim)"
              },
              "3.5.1": {
                "activity": "White Door Painting (One Side)"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              }
            }
          },
          "3.6.2": {
            "activity": "White Window Painting (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.6.1": {
                "activity": "White Window Painting (One Side)"
              },
              "3.5.2": {
                "activity": "White Door Painting (Two Sides, Jamb, and Trim)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "3.6.3": {
            "activity": "Color Window Painting (One Side)",
            "recommendedActivities": {
              "3.6.4": {
                "activity": "Color Window Painting (Two Sides, Jamb, and Trim)"
              },
              "3.5.3": {
                "activity": "Color Door Painting (One Side)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              }
            }
          },
          "3.6.4": {
            "activity": "Color Window Painting (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.6.3": {
                "activity": "Color Window Painting (One Side)"
              },
              "3.5.4": {
                "activity": "Color Door Painting (Two Sides, Jamb, and Trim)"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          },
          "3.6.5": {
            "activity": "Window Staining and Finishing (One Side, Jamb, and Trim)",
            "recommendedActivities": {
              "3.6.6": {
                "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)"
              },
              "3.5.5": {
                "activity": "Door Staining and Finishing (One Side, Jamb, and Trim)"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              }
            }
          },
          "3.6.6": {
            "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)",
            "recommendedActivities": {
              "3.6.5": {
                "activity": "Window Staining and Finishing (One Side, Jamb, and Trim)"
              },
              "3.5.6": {
                "activity": "Door Staining and Finishing (Two Sides, Jamb, and Trim)"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          }
        }
      },
      "3.7": {
        "category": "Cabinetry",
        "activities": {
          "3.7.1": {
            "activity": "Full Height Cabinet Strip and Refinish (Faces Only)",
            "recommendedActivities": {
              "3.7.2": {
                "activity": "Lower/Upper Cabinet Strip and Refinish (Faces Only)"
              },
              "6.1.5": {
                "activity": "Cabinetry Restoration and Repair"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.6.2": {
                "activity": "White Window Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "3.7.2": {
            "activity": "Lower/Upper Cabinet Strip and Refinish (Faces Only)",
            "recommendedActivities": {
              "3.7.1": {
                "activity": "Full Height Cabinet Strip and Refinish (Faces Only)"
              },
              "6.1.3": {
                "activity": "Upper (Wall) or Lower (Base) Cabinet Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.6.4": {
                "activity": "Color Window Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "3.7.3": {
            "activity": "Full Height Cabinet Seal and Paint",
            "recommendedActivities": {
              "3.7.4": {
                "activity": "Lower/Upper Cabinet Seal and Paint"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.6.6": {
                "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "3.7.4": {
            "activity": "Lower/Upper Cabinet Seal and Paint",
            "recommendedActivities": {
              "3.7.3": {
                "activity": "Full Height Cabinet Seal and Paint"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.6.6": {
                "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "3.7.5": {
            "activity": "Full-height Cabinet Painting",
            "recommendedActivities": {
              "3.7.6": {
                "activity": "Lower/Upper Cabinet Painting"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.6.4": {
                "activity": "Color Window Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "3.7.6": {
            "activity": "Lower/Upper Cabinet Painting",
            "recommendedActivities": {
              "3.7.5": {
                "activity": "Full-height Cabinet Painting"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.6.4": {
                "activity": "Color Window Painting (Two Sides, Jamb, and Trim)"
              }
            }
          }
        }
      },
      "3.8": {
        "category": "Wallpaper",
        "activities": {
          "3.8.1": {
            "activity": "Wallpaper Removal",
            "recommendedActivities": {
              "3.8.2": {
                "activity": "Wallpaper Installation"
              },
              "3.8.4": {
                "activity": "Sisal Wallpaper Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              }
            }
          },
          "3.8.2": {
            "activity": "Wallpaper Installation",
            "recommendedActivities": {
              "3.8.1": {
                "activity": "Wallpaper Removal"
              },
              "3.8.4": {
                "activity": "Sisal Wallpaper Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              }
            }
          },
          "3.8.3": {
            "activity": "Fabric Wallpaper Installation",
            "recommendedActivities": {
              "3.8.2": {
                "activity": "Wallpaper Installation"
              },
              "3.8.6": {
                "activity": "Paintable Wallpaper Installation"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "3.8.4": {
            "activity": "Sisal Wallpaper Installation",
            "recommendedActivities": {
              "3.8.3": {
                "activity": "Fabric Wallpaper Installation"
              },
              "3.8.6": {
                "activity": "Paintable Wallpaper Installation"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "3.8.5": {
            "activity": "Border Installation",
            "recommendedActivities": {
              "3.8.2": {
                "activity": "Wallpaper Installation"
              },
              "3.8.6": {
                "activity": "Paintable Wallpaper Installation"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "3.8.6": {
            "activity": "Paintable Wallpaper Installation",
            "recommendedActivities": {
              "3.8.2": {
                "activity": "Wallpaper Installation"
              },
              "3.8.5": {
                "activity": "Border Installation"
              },
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          }
        }
      },
      "3.9": {
        "category": "Concrete and Masonry",
        "activities": {
          "3.9.1": {
            "activity": "Concrete and Masonry Painting (Two Coats)",
            "recommendedActivities": {
              "3.9.2": {
                "activity": "Block Sealing"
              },
              "3.9.3": {
                "activity": "Mold Removal and Wall Protection"
              },
              "3.1.6": {
                "activity": "Concrete and Masonry Wall Painting"
              },
              "3.8.6": {
                "activity": "Paintable Wallpaper Installation"
              }
            }
          },
          "3.9.2": {
            "activity": "Block Sealing",
            "recommendedActivities": {
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.9.3": {
                "activity": "Mold Removal and Wall Protection"
              },
              "3.1.6": {
                "activity": "Concrete and Masonry Wall Painting"
              },
              "3.1.7": {
                "activity": "Wall Staining and Finishing"
              }
            }
          },
          "3.9.3": {
            "activity": "Mold Removal and Wall Protection",
            "recommendedActivities": {
              "3.9.1": {
                "activity": "Concrete and Masonry Painting (Two Coats)"
              },
              "3.9.2": {
                "activity": "Block Sealing"
              },
              "3.1.7": {
                "activity": "Wall Staining and Finishing"
              },
              "3.8.6": {
                "activity": "Paintable Wallpaper Installation"
              }
            }
          }
        }
      },
      "3.10": {
        "category": "Baseboard",
        "activities": {
          "3.10.1": {
            "activity": "Baseboard Painting",
            "recommendedActivities": {
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              },
              "3.1.2": {
                "activity": "Wall Painting Refresh (One Coat)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              }
            }
          },
          "3.10.2": {
            "activity": "Baseboard Staining and Finishing",
            "recommendedActivities": {
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              },
              "3.5.6": {
                "activity": "Door Staining and Finishing (Two Sides, Jamb, and Trim)"
              },
              "3.1.7": {
                "activity": "Wall Staining and Finishing"
              }
            }
          }
        }
      }
    }
  },
  "4": {
    "section": "Tiling",
    "categories": {
      "4.1": {
        "category": "Ceramic",
        "activities": {
          "4.1.1": {
            "activity": "Ceramic Tile Removal",
            "recommendedActivities": {
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "3.9.3": {
                "activity": "Mold Removal and Wall Protection"
              }
            }
          },
          "4.1.2": {
            "activity": "Ceramic Tile Installation",
            "recommendedActivities": {
              "4.1.4": {
                "activity": "Ceramic Tile Customization"
              },
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.8.5": {
                "activity": "Uncoupling Mat for Tile Installation"
              },
              "4.8.6": {
                "activity": "Cement board Installation"
              }
            }
          },
          "4.1.3": {
            "activity": "Ceramic Tile Repair",
            "recommendedActivities": {
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.1.4": {
                "activity": "Ceramic Tile Customization"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.1.4": {
            "activity": "Ceramic Tile Customization",
            "recommendedActivities": {
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.2.4": {
                "activity": "Porcelain Tile Customization"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          },
          "4.1.5": {
            "activity": "Ceramic Tile Regrouting",
            "recommendedActivities": {
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              },
              "4.1.4": {
                "activity": "Ceramic Tile Customization"
              },
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              }
            }
          }
        }
      },
      "4.2": {
        "category": "Porcelain",
        "activities": {
          "4.2.1": {
            "activity": "Porcelain Tile Removal",
            "recommendedActivities": {
              "4.2.2": {
                "activity": "Porcelain Tile Installation"
              },
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "3.9.3": {
                "activity": "Mold Removal and Wall Protection"
              }
            }
          },
          "4.2.2": {
            "activity": "Porcelain Tile Installation",
            "recommendedActivities": {
              "4.2.4": {
                "activity": "Porcelain Tile Customization"
              },
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              },
              "4.8.5": {
                "activity": "Uncoupling Mat for Tile Installation"
              },
              "4.8.6": {
                "activity": "Cement board Installation"
              }
            }
          },
          "4.2.3": {
            "activity": "Porcelain Tile Repair",
            "recommendedActivities": {
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              },
              "4.2.2": {
                "activity": "Porcelain Tile Installation"
              },
              "4.2.4": {
                "activity": "Porcelain Tile Customization"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.2.4": {
            "activity": "Porcelain Tile Customization",
            "recommendedActivities": {
              "4.2.2": {
                "activity": "Porcelain Tile Installation"
              },
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              },
              "4.1.4": {
                "activity": "Ceramic Tile Customization"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          },
          "4.2.5": {
            "activity": "Porcelain Tile Regrouting",
            "recommendedActivities": {
              "4.2.2": {
                "activity": "Porcelain Tile Installation"
              },
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.2.4": {
                "activity": "Porcelain Tile Customization"
              },
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              }
            }
          }
        }
      },
      "4.3": {
        "category": "Natural Stone",
        "activities": {
          "4.3.1": {
            "activity": "Natural Stone Removal",
            "recommendedActivities": {
              "4.3.5": {
                "activity": "Natural Stone Threshold Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.9.1": {
                "activity": "Vanity Top Removal"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              }
            }
          },
          "4.3.2": {
            "activity": "Wall Veneer Panels Installation",
            "recommendedActivities": {
              "4.3.4": {
                "activity": "Natural Stone Sill Installation"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          },
          "4.3.3": {
            "activity": "Natural Stone Tile Installation",
            "recommendedActivities": {
              "4.3.4": {
                "activity": "Natural Stone Sill Installation"
              },
              "4.3.5": {
                "activity": "Natural Stone Threshold Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.3.4": {
            "activity": "Natural Stone Sill Installation",
            "recommendedActivities": {
              "4.3.3": {
                "activity": "Natural Stone Tile Installation"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.9.2": {
                "activity": "Single Sink Installation"
              }
            }
          },
          "4.3.5": {
            "activity": "Natural Stone Threshold Installation",
            "recommendedActivities": {
              "4.3.3": {
                "activity": "Natural Stone Tile Installation"
              },
              "4.3.4": {
                "activity": "Natural Stone Sill Installation"
              },
              "4.8.2": {
                "activity": "Mortar Bed Preparation for Tile Floors"
              }
            }
          },
          "4.3.6": {
            "activity": "Natural Stone Countertop Installation",
            "recommendedActivities": {
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.9.2": {
                "activity": "Single Sink Installation"
              },
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              }
            }
          },
          "4.3.7": {
            "activity": "Cut for Sink Opening in Natural Marble",
            "recommendedActivities": {
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.9.3": {
                "activity": "Double Sink Installation"
              },
              "4.8.4": {
                "activity": "Mortar Bed Preparation for Tile Walls"
              }
            }
          },
          "4.3.8": {
            "activity": "Natural Stone Mosaic Installation",
            "recommendedActivities": {
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          }
        }
      },
      "4.4": {
        "category": "Mosaic",
        "activities": {
          "4.4.1": {
            "activity": "Marble Mosaic Installation",
            "recommendedActivities": {
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.4.2": {
            "activity": "Glass Mosaic Installation",
            "recommendedActivities": {
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.5.2": {
                "activity": "Waterproofing and Tile Shower Installation (up to 60 SF)"
              }
            }
          },
          "4.4.3": {
            "activity": "Porcelain Mosaic Installation",
            "recommendedActivities": {
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.5.3": {
                "activity": "Waterproofing and Tile Shower Installation (61 to 100 SF)"
              }
            }
          },
          "4.4.4": {
            "activity": "Mosaic Removal",
            "recommendedActivities": {
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.1.1": {
                "activity": "Ceramic Tile Removal"
              },
              "4.3.1": {
                "activity": "Natural Stone Removal"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              }
            }
          }
        }
      },
      "4.5": {
        "category": "Bathroom",
        "activities": {
          "4.5.1": {
            "activity": "Bathroom Demolition and Removal",
            "recommendedActivities": {
              "4.5.2": {
                "activity": "Waterproofing and Tile Shower Installation (up to 60 SF)"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "4.9.1": {
                "activity": "Vanity Top Removal"
              }
            }
          },
          "4.5.2": {
            "activity": "Waterproofing and Tile Shower Installation (up to 60 SF)",
            "recommendedActivities": {
              "4.5.3": {
                "activity": "Waterproofing and Tile Shower Installation (61 to 100 SF)"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.5.3": {
            "activity": "Waterproofing and Tile Shower Installation (61 to 100 SF)",
            "recommendedActivities": {
              "4.5.4": {
                "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)"
              },
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.5.4": {
            "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)",
            "recommendedActivities": {
              "4.5.3": {
                "activity": "Waterproofing and Tile Shower Installation (61 to 100 SF)"
              },
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.5.5": {
            "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)",
            "recommendedActivities": {
              "4.5.4": {
                "activity": "Waterproofing and Tile Shower Installation (101 to 120 SF)"
              },
              "4.4.1": {
                "activity": "Marble Mosaic Installation"
              },
              "4.4.3": {
                "activity": "Porcelain Mosaic Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.5.6": {
            "activity": "Bathroom Mirror Installation",
            "recommendedActivities": {
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.9.3": {
                "activity": "Double Sink Installation"
              }
            }
          },
          "4.5.7": {
            "activity": "Bathroom Accessories Installation",
            "recommendedActivities": {
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              },
              "4.4.2": {
                "activity": "Glass Mosaic Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          }
        }
      },
      "4.6": {
        "category": "Kitchen",
        "activities": {
          "4.6.1": {
            "activity": "Countertop Tile Installation",
            "recommendedActivities": {
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.3": {
                "activity": "Natural Stone Tile Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          },
          "4.6.2": {
            "activity": "Tile Backsplash Installation",
            "recommendedActivities": {
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              },
              "4.6.4": {
                "activity": "Solid Surface Countertop Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              },
              "4.1.4": {
                "activity": "Ceramic Tile Customization"
              }
            }
          },
          "4.6.3": {
            "activity": "Natural Stone Countertop Installation",
            "recommendedActivities": {
              "4.6.4": {
                "activity": "Solid Surface Countertop Installation"
              },
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.3.6": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              }
            }
          },
          "4.6.4": {
            "activity": "Solid Surface Countertop Installation",
            "recommendedActivities": {
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.3.4": {
                "activity": "Natural Stone Sill Installation"
              },
              "4.7.1": {
                "activity": "Fireplace Hearth Tile Installation"
              }
            }
          },
          "4.6.5": {
            "activity": "Floor Tile Installation",
            "recommendedActivities": {
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.1.2": {
                "activity": "Ceramic Tile Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              },
              "4.7.1": {
                "activity": "Fireplace Hearth Tile Installation"
              }
            }
          },
          "4.6.6": {
            "activity": "Tile Floor Regrouting",
            "recommendedActivities": {
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.7.1": {
                "activity": "Fireplace Hearth Tile Installation"
              },
              "4.1.5": {
                "activity": "Ceramic Tile Regrouting"
              },
              "4.2.5": {
                "activity": "Porcelain Tile Regrouting"
              }
            }
          },
          "4.6.7": {
            "activity": "Tile and Stone Repair",
            "recommendedActivities": {
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.3.3": {
                "activity": "Natural Stone Tile Installation"
              },
              "4.1.3": {
                "activity": "Ceramic Tile Repair"
              },
              "4.2.3": {
                "activity": "Porcelain Tile Repair"
              },
              "4.7.1": {
                "activity": "Fireplace Hearth Tile Installation"
              }
            }
          }
        }
      },
      "4.7": {
        "category": "Fireplace",
        "activities": {
          "4.7.1": {
            "activity": "Fireplace Hearth Tile Installation",
            "recommendedActivities": {
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.7.2": {
                "activity": "Masonry Fireplace & Chimney Removal"
              },
              "4.7.3": {
                "activity": "Chimney Veneer Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.7.2": {
            "activity": "Masonry Fireplace & Chimney Removal",
            "recommendedActivities": {
              "4.7.3": {
                "activity": "Chimney Veneer Installation"
              },
              "4.7.4": {
                "activity": "Chimney Veneer Removal"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              },
              "4.7.5": {
                "activity": "Veneer and Chimney Cleaning"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              }
            }
          },
          "4.7.3": {
            "activity": "Chimney Veneer Installation",
            "recommendedActivities": {
              "4.7.4": {
                "activity": "Chimney Veneer Removal"
              },
              "4.7.5": {
                "activity": "Veneer and Chimney Cleaning"
              },
              "4.7.2": {
                "activity": "Masonry Fireplace & Chimney Removal"
              },
              "4.3.2": {
                "activity": "Wall Veneer Panels Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.7.4": {
            "activity": "Chimney Veneer Removal",
            "recommendedActivities": {
              "4.7.3": {
                "activity": "Chimney Veneer Installation"
              },
              "4.7.5": {
                "activity": "Veneer and Chimney Cleaning"
              },
              "4.7.2": {
                "activity": "Masonry Fireplace & Chimney Removal"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "4.5.1": {
                "activity": "Bathroom Demolition and Removal"
              }
            }
          },
          "4.7.5": {
            "activity": "Veneer and Chimney Cleaning",
            "recommendedActivities": {
              "4.7.4": {
                "activity": "Chimney Veneer Removal"
              },
              "4.7.3": {
                "activity": "Chimney Veneer Installation"
              },
              "4.7.2": {
                "activity": "Masonry Fireplace & Chimney Removal"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          }
        }
      },
      "4.8": {
        "category": "Subfloor",
        "activities": {
          "4.8.1": {
            "activity": "Leveling with Cement",
            "recommendedActivities": {
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.8.2": {
                "activity": "Mortar Bed Preparation for Tile Floors"
              },
              "4.10.1": {
                "activity": "Floor Heating Mat Installation"
              },
              "4.10.2": {
                "activity": "Ditra-Heat Heating Cables Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.8.2": {
            "activity": "Mortar Bed Preparation for Tile Floors",
            "recommendedActivities": {
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "4.8.1": {
                "activity": "Leveling with Cement"
              },
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.10.1": {
                "activity": "Floor Heating Mat Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.8.3": {
            "activity": "Mortar Bed Removal",
            "recommendedActivities": {
              "4.8.2": {
                "activity": "Mortar Bed Preparation for Tile Floors"
              },
              "4.8.4": {
                "activity": "Mortar Bed Preparation for Tile Walls"
              },
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.9.1": {
                "activity": "Vanity Top Removal"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.8.4": {
            "activity": "Mortar Bed Preparation for Tile Walls",
            "recommendedActivities": {
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              },
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              }
            }
          },
          "4.8.5": {
            "activity": "Uncoupling Mat for Tile Installation",
            "recommendedActivities": {
              "4.8.6": {
                "activity": "Cement Board Installation"
              },
              "4.8.1": {
                "activity": "Leveling with Cement"
              },
              "4.10.1": {
                "activity": "Floor Heating Mat Installation"
              },
              "4.10.2": {
                "activity": "Ditra-Heat Heating Cables Installation"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              }
            }
          },
          "4.8.6": {
            "activity": "Cement Board Installation",
            "recommendedActivities": {
              "4.8.2": {
                "activity": "Mortar Bed Preparation for Tile Floors"
              },
              "4.8.5": {
                "activity": "Uncoupling Mat for Tile Installation"
              },
              "4.8.4": {
                "activity": "Mortar Bed Preparation for Tile Walls"
              },
              "4.10.1": {
                "activity": "Floor Heating Mat Installation"
              },
              "4.10.2": {
                "activity": "Ditra-Heat Heating Cables Installation"
              }
            }
          }
        }
      },
      "4.9": {
        "category": "Vanity Top",
        "activities": {
          "4.9.1": {
            "activity": "Vanity Top Removal",
            "recommendedActivities": {
              "4.9.2": {
                "activity": "Single Sink Installation"
              },
              "4.9.3": {
                "activity": "Double Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              }
            }
          },
          "4.9.2": {
            "activity": "Single Sink Installation",
            "recommendedActivities": {
              "4.9.3": {
                "activity": "Double Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              }
            }
          },
          "4.9.3": {
            "activity": "Double Sink Installation",
            "recommendedActivities": {
              "4.9.2": {
                "activity": "Single Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.5.6": {
                "activity": "Bathroom Mirror Installation"
              },
              "4.5.7": {
                "activity": "Bathroom Accessories Installation"
              }
            }
          }
        }
      },
      "4.10": {
        "category": "Underfloor Heating",
        "activities": {
          "4.10.1": {
            "activity": "Floor Heating Mat Installation",
            "recommendedActivities": {
              "4.10.2": {
                "activity": "Ditra-Heat Heating Cables Installation"
              },
              "4.8.5": {
                "activity": "Uncoupling Mat for Tile Installation"
              },
              "4.8.1": {
                "activity": "Leveling with Cement"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              }
            }
          },
          "4.10.2": {
            "activity": "Ditra-Heat Heating Cables Installation",
            "recommendedActivities": {
              "4.10.1": {
                "activity": "Floor Heating Mat Installation"
              },
              "4.8.5": {
                "activity": "Uncoupling Mat for Tile Installation"
              },
              "4.8.1": {
                "activity": "Leveling with Cement"
              },
              "4.6.5": {
                "activity": "Floor Tile Installation"
              },
              "4.6.6": {
                "activity": "Tile Floor Regrouting"
              }
            }
          }
        }
      }
    }
  },
  "5": {
    "section": "Flooring",
    "categories": {
      "5.1": {
        "category": "Carpet",
        "activities": {
          "5.1.1": {
            "activity": "Carpet Removal",
            "recommendedActivities": {
              "5.1.2": {
                "activity": "Carpet Installation"
              },
              "5.2.1": {
                "activity": "Carpet Pad Removal"
              },
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.3.1": {
                "activity": "Vinyl Tile Removal"
              }
            }
          },
          "5.1.2": {
            "activity": "Carpet Installation",
            "recommendedActivities": {
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.3.2": {
                "activity": "Vinyl Tile Installation"
              },
              "5.1.4": {
                "activity": "Stairs Carpet Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          },
          "5.1.3": {
            "activity": "Carpet Tile Installation",
            "recommendedActivities": {
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.1.4": {
                "activity": "Stairs Carpet Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          },
          "5.1.4": {
            "activity": "Stairs Carpet Installation",
            "recommendedActivities": {
              "5.1.2": {
                "activity": "Carpet Installation"
              },
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          }
        }
      },
      "5.2": {
        "category": "Carpet pad",
        "activities": {
          "5.2.1": {
            "activity": "Carpet Pad Removal",
            "recommendedActivities": {
              "5.1.1": {
                "activity": "Carpet Removal"
              },
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.3.1": {
                "activity": "Vinyl Tile Removal"
              }
            }
          },
          "5.2.2": {
            "activity": "Carpet Pad Installation",
            "recommendedActivities": {
              "5.1.2": {
                "activity": "Carpet Installation"
              },
              "5.1.4": {
                "activity": "Stairs Carpet Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          }
        }
      },
      "5.3": {
        "category": "Vinyl tile",
        "activities": {
          "5.3.1": {
            "activity": "Vinyl Tile Removal",
            "recommendedActivities": {
              "5.2.1": {
                "activity": "Carpet Pad Removal"
              },
              "5.3.2": {
                "activity": "Vinyl tile Installation"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          },
          "5.3.2": {
            "activity": "Vinyl tile Installation",
            "recommendedActivities": {
              "5.3.3": {
                "activity": "Self-Adhesive Vinyl Tile Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          },
          "5.3.3": {
            "activity": "Self-Adhesive Vinyl Tile Installation",
            "recommendedActivities": {
              "5.3.2": {
                "activity": "Vinyl tile Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              }
            }
          }
        }
      },
      "5.4": {
        "category": "Vinyl covering",
        "activities": {
          "5.4.1": {
            "activity": "Vinyl Covering Removal",
            "recommendedActivities": {
              "5.4.2": {
                "activity": "Vinyl Covering Installation"
              },
              "5.4.3": {
                "activity": "Vinyl Plank Installation"
              },
              "5.4.4": {
                "activity": "Vinyl Stair Tread Installation"
              },
              "5.5.1": {
                "activity": "Laminate Flooring Removal"
              },
              "5.1.1": {
                "activity": "Carpet Removal"
              }
            }
          },
          "5.4.2": {
            "activity": "Vinyl Covering Installation",
            "recommendedActivities": {
              "5.4.3": {
                "activity": "Vinyl Plank Installation"
              },
              "5.4.4": {
                "activity": "Vinyl Stair Tread Installation"
              },
              "5.2.2": {
                "activity": "Carpet Pad Installation"
              },
              "5.5.2": {
                "activity": "Laminate Flooring Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          },
          "5.4.3": {
            "activity": "Vinyl Plank Installation",
            "recommendedActivities": {
              "5.4.2": {
                "activity": "Vinyl Covering Installation"
              },
              "5.4.4": {
                "activity": "Vinyl Stair Tread Installation"
              },
              "5.5.2": {
                "activity": "Laminate Flooring Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.6.2": {
                "activity": "Bamboo flooring Installation"
              }
            }
          },
          "5.4.4": {
            "activity": "Vinyl Stair Tread Installation",
            "recommendedActivities": {
              "5.4.3": {
                "activity": "Vinyl Plank Installation"
              },
              "5.5.2": {
                "activity": "Laminate Flooring Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.6.2": {
                "activity": "Bamboo flooring Installation"
              },
              "5.1.4": {
                "activity": "Stairs Carpet Installation"
              }
            }
          }
        }
      },
      "5.5": {
        "category": "Laminate",
        "activities": {
          "5.5.1": {
            "activity": "Laminate Flooring Removal",
            "recommendedActivities": {
              "5.5.2": {
                "activity": "Laminate Flooring Installation"
              },
              "5.4.1": {
                "activity": "Vinyl Covering Removal"
              },
              "5.6.1": {
                "activity": "Bamboo Flooring Removal"
              },
              "5.3.1": {
                "activity": "Vinyl Tile Removal"
              }
            }
          },
          "5.5.2": {
            "activity": "Laminate Flooring Installation",
            "recommendedActivities": {
              "5.5.1": {
                "activity": "Laminate Flooring Removal"
              },
              "5.4.2": {
                "activity": "Vinyl Covering Installation"
              },
              "5.6.2": {
                "activity": "Bamboo flooring Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.1.2": {
                "activity": "Carpet Installation"
              }
            }
          }
        }
      },
      "5.6": {
        "category": "Bamboo flooring",
        "activities": {
          "5.6.1": {
            "activity": "Bamboo Flooring Removal",
            "recommendedActivities": {
              "5.6.2": {
                "activity": "Bamboo flooring Installation"
              },
              "5.5.1": {
                "activity": "Laminate Flooring Removal"
              },
              "5.4.1": {
                "activity": "Vinyl Covering Removal"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          },
          "5.6.2": {
            "activity": "Bamboo flooring Installation",
            "recommendedActivities": {
              "5.6.1": {
                "activity": "Bamboo Flooring Removal"
              },
              "5.5.2": {
                "activity": "Laminate Flooring Installation"
              },
              "5.4.3": {
                "activity": "Vinyl Plank Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          }
        }
      },
      "5.7": {
        "category": "Wood floor",
        "activities": {
          "5.7.1": {
            "activity": "Wood Floor Sanding, Staining, and Finishing",
            "recommendedActivities": {
              "5.8.3": {
                "activity": "Pre-Finished Solid Wood Floor Repair"
              },
              "5.9.2": {
                "activity": "Engineered Wood Floating Floor Installation"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              },
              "5.9.3": {
                "activity": "Engineered Wood Glue-Down Floor Installation"
              },
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              }
            }
          },
          "5.7.2": {
            "activity": "Parquet Flooring Removal",
            "recommendedActivities": {
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.8.1": {
                "activity": "Pre-Finished Solid Wood Flooring Removal"
              },
              "5.9.1": {
                "activity": "Engineered Wood Removal"
              },
              "5.6.1": {
                "activity": "Bamboo Flooring Removal"
              }
            }
          }
        }
      },
      "5.8": {
        "category": "Solid wood",
        "activities": {
          "5.8.1": {
            "activity": "Pre-Finished Solid Wood Flooring Removal",
            "recommendedActivities": {
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              },
              "5.8.3": {
                "activity": "Pre-Finished Solid Wood Floor Repair"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              },
              "5.9.1": {
                "activity": "Engineered Wood Removal"
              }
            }
          },
          "5.8.2": {
            "activity": "Pre-finished Solid Wood Installation",
            "recommendedActivities": {
              "5.8.1": {
                "activity": "Pre-Finished Solid Wood Flooring Removal"
              },
              "5.8.3": {
                "activity": "Pre-Finished Solid Wood Floor Repair"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.9.2": {
                "activity": "Engineered Wood Floating Floor Installation"
              }
            }
          },
          "5.8.3": {
            "activity": "Pre-Finished Solid Wood Floor Repair",
            "recommendedActivities": {
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.9.3": {
                "activity": "Engineered Wood Glue-Down Floor Installation"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          }
        }
      },
      "5.9": {
        "category": "Engineered wood",
        "activities": {
          "5.9.1": {
            "activity": "Engineered Wood Removal",
            "recommendedActivities": {
              "5.9.2": {
                "activity": "Engineered Wood Floating Floor Installation"
              },
              "5.9.3": {
                "activity": "Engineered Wood Glue-Down Floor Installation"
              },
              "5.8.1": {
                "activity": "Pre-Finished Solid Wood Flooring Removal"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              }
            }
          },
          "5.9.2": {
            "activity": "Engineered Wood Floating Floor Installation",
            "recommendedActivities": {
              "5.9.1": {
                "activity": "Engineered Wood Removal"
              },
              "5.9.3": {
                "activity": "Engineered Wood Glue-Down Floor Installation"
              },
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          },
          "5.9.3": {
            "activity": "Engineered Wood Glue-Down Floor Installation",
            "recommendedActivities": {
              "5.9.2": {
                "activity": "Engineered Wood Floating Floor Installation"
              },
              "5.9.1": {
                "activity": "Engineered Wood Removal"
              },
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          }
        }
      },
      "5.10": {
        "category": "Underlayment",
        "activities": {
          "5.10.1": {
            "activity": "Plywood Underlayment Removal",
            "recommendedActivities": {
              "5.10.2": {
                "activity": "Plywood Underlayment Installation"
              },
              "5.1.1": {
                "activity": "Carpet Removal"
              },
              "5.3.1": {
                "activity": "Vinyl Tile Removal"
              },
              "5.7.2": {
                "activity": "Parquet Flooring Removal"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              }
            }
          },
          "5.10.2": {
            "activity": "Plywood Underlayment Installation",
            "recommendedActivities": {
              "5.10.1": {
                "activity": "Plywood Underlayment Removal"
              },
              "5.8.2": {
                "activity": "Pre-finished Solid Wood Installation"
              },
              "5.9.2": {
                "activity": "Engineered Wood Floating Floor Installation"
              },
              "5.3.2": {
                "activity": "Vinyl tile Installation"
              },
              "5.6.2": {
                "activity": "Bamboo flooring Installation"
              }
            }
          }
        }
      },
      "5.11": {
        "category": "Baseboard",
        "activities": {
          "5.11.1": {
            "activity": "Baseboard Removal",
            "recommendedActivities": {
              "5.11.2": {
                "activity": "Baseboard Installation"
              },
              "5.10.1": {
                "activity": "Plywood Underlayment Removal"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          },
          "5.11.2": {
            "activity": "Baseboard Installation",
            "recommendedActivities": {
              "5.11.1": {
                "activity": "Baseboard Removal"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              },
              "5.10.2": {
                "activity": "Plywood Underlayment Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          }
        }
      }
    }
  },
  "6": {
    "section": "Carpentry",
    "categories": {
      "6.1": {
        "category": "Cabinet",
        "activities": {
          "6.1.1": {
            "activity": "Full Height Cabinet Detachment and Resetting",
            "recommendedActivities": {
              "6.1.2": {
                "activity": "Full Height Cabinet Removal"
              },
              "6.1.3": {
                "activity": "Upper (Wall) or Lower (Base) Cabinet Installation"
              },
              "6.1.5": {
                "activity": "Cabinetry Restoration and Repair"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.9.1": {
                "activity": "Vanity Top Removal"
              }
            }
          },
          "6.1.2": {
            "activity": "Full Height Cabinet Removal",
            "recommendedActivities": {
              "6.1.1": {
                "activity": "Full Height Cabinet Detachment and Resetting"
              },
              "6.1.3": {
                "activity": "Upper (Wall) or Lower (Base) Cabinet Installation"
              },
              "4.9.1": {
                "activity": "Vanity Top Removal"
              },
              "4.8.3": {
                "activity": "Mortar Bed Removal"
              }
            }
          },
          "6.1.3": {
            "activity": "Upper (Wall) or Lower (Base) Cabinet Installation",
            "recommendedActivities": {
              "6.1.1": {
                "activity": "Full Height Cabinet Detachment and Resetting"
              },
              "6.1.5": {
                "activity": "Cabinetry Restoration and Repair"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.9.2": {
                "activity": "Single Sink Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              }
            }
          },
          "6.1.4": {
            "activity": "Cabinet Drawer Front Installation",
            "recommendedActivities": {
              "6.1.3": {
                "activity": "Upper (Wall) or Lower (Base) Cabinet Installation"
              },
              "6.1.5": {
                "activity": "Cabinetry Restoration and Repair"
              },
              "4.3.7": {
                "activity": "Cut for Sink Opening in Natural Marble"
              },
              "4.9.3": {
                "activity": "Double Sink Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              }
            }
          },
          "6.1.5": {
            "activity": "Cabinetry Restoration and Repair",
            "recommendedActivities": {
              "6.1.3": {
                "activity": "Upper (Wall) or Lower (Base) Cabinet Installation"
              },
              "6.1.4": {
                "activity": "Cabinet Drawer Front Installation"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.7": {
                "activity": "Tile and Stone Repair"
              },
              "4.9.2": {
                "activity": "Single Sink Installation"
              }
            }
          }
        }
      },
      "6.2": {
        "category": "Trim and Molding",
        "activities": {
          "6.2.1": {
            "activity": "Baseboard Installation",
            "recommendedActivities": {
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "6.2.3": {
                "activity": "Brick Mold Installation"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              }
            }
          },
          "6.2.2": {
            "activity": "Casing Installation",
            "recommendedActivities": {
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              },
              "3.10.2": {
                "activity": "Baseboard Staining and Finishing"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              }
            }
          },
          "6.2.3": {
            "activity": "Brick Mold Installation",
            "recommendedActivities": {
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              },
              "3.10.1": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "6.2.4": {
            "activity": "Crown Molding Installation",
            "recommendedActivities": {
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              }
            }
          }
        }
      },
      "6.3": {
        "category": "Framing",
        "activities": {
          "6.3.1": {
            "activity": "6-Inch Load-Bearing Wall Installation",
            "recommendedActivities": {
              "6.3.2": {
                "activity": "4-Inch Non-Bearing Wall Installation"
              },
              "6.3.3": {
                "activity": "Curved Wall (Radius) Installation"
              },
              "6.3.4": {
                "activity": "Ceiling Structure Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "6.3.6": {
                "activity": "Framing Removal from Structure"
              }
            }
          },
          "6.3.2": {
            "activity": "4-Inch Non-Bearing Wall Installation",
            "recommendedActivities": {
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.3": {
                "activity": "Curved Wall (Radius) Installation"
              },
              "6.3.4": {
                "activity": "Ceiling Structure Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              }
            }
          },
          "6.3.3": {
            "activity": "Curved Wall (Radius) Installation",
            "recommendedActivities": {
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.2": {
                "activity": "4-Inch Non-Bearing Wall Installation"
              },
              "6.3.4": {
                "activity": "Ceiling Structure Installation"
              },
              "6.3.5": {
                "activity": "Rafter Structure Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              }
            }
          },
          "6.3.4": {
            "activity": "Ceiling Structure Installation",
            "recommendedActivities": {
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.3": {
                "activity": "Curved Wall (Radius) Installation"
              },
              "6.3.5": {
                "activity": "Rafter Structure Installation"
              },
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              }
            }
          },
          "6.3.5": {
            "activity": "Rafter Structure Installation",
            "recommendedActivities": {
              "6.3.4": {
                "activity": "Ceiling Structure Installation"
              },
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              }
            }
          },
          "6.3.6": {
            "activity": "Framing Removal from Structure",
            "recommendedActivities": {
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.2": {
                "activity": "4-Inch Non-Bearing Wall Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              },
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              }
            }
          }
        }
      },
      "6.4": {
        "category": "Beam and Column",
        "activities": {
          "6.4.1": {
            "activity": "Column Installation",
            "recommendedActivities": {
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              },
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.5": {
                "activity": "Rafter Structure Installation"
              },
              "6.3.6": {
                "activity": "Framing Removal from Structure"
              }
            }
          },
          "6.4.2": {
            "activity": "Engineered Strand Lumber Installation",
            "recommendedActivities": {
              "6.4.3": {
                "activity": "Beam Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              },
              "6.3.4": {
                "activity": "Ceiling Structure Installation"
              },
              "6.3.5": {
                "activity": "Rafter Structure Installation"
              },
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              }
            }
          },
          "6.4.3": {
            "activity": "Beam Installation",
            "recommendedActivities": {
              "6.4.2": {
                "activity": "Engineered Strand Lumber Installation"
              },
              "6.4.1": {
                "activity": "Column Installation"
              },
              "6.3.1": {
                "activity": "6-Inch Load-Bearing Wall Installation"
              },
              "6.3.5": {
                "activity": "Rafter Structure Installation"
              },
              "6.3.3": {
                "activity": "Curved Wall (Radius) Installation"
              }
            }
          }
        }
      },
      "6.5": {
        "category": "Foundation",
        "activities": {
          "6.5.1": {
            "activity": "Building Foundation Excavation",
            "recommendedActivities": {
              "6.5.2": {
                "activity": "Foundation Backfilling"
              },
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.5": {
                "activity": "12-Inch Concrete Pile Installation"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.7": {
                "activity": "Concrete Step Installation"
              }
            }
          },
          "6.5.2": {
            "activity": "Foundation Backfilling",
            "recommendedActivities": {
              "6.5.1": {
                "activity": "Building Foundation Excavation"
              },
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.7": {
                "activity": "Concrete Step Installation"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              }
            }
          },
          "6.5.3": {
            "activity": "Concrete Wall Installation",
            "recommendedActivities": {
              "6.5.2": {
                "activity": "Foundation Backfilling"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.6": {
                "activity": "Concrete Patching (up to 14 sq. ft.)"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              },
              "6.5.9": {
                "activity": "Helical Post Installation"
              }
            }
          },
          "6.5.4": {
            "activity": "Concrete Column Installation",
            "recommendedActivities": {
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.5": {
                "activity": "12-Inch Concrete Pile Installation"
              },
              "6.5.6": {
                "activity": "Concrete Patching (up to 14 sq. ft.)"
              },
              "6.5.7": {
                "activity": "Concrete Step Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              }
            }
          },
          "6.5.5": {
            "activity": "12-Inch Concrete Pile Installation",
            "recommendedActivities": {
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.6": {
                "activity": "Concrete Patching (up to 14 sq. ft.)"
              },
              "6.5.9": {
                "activity": "Helical Post Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              }
            }
          },
          "6.5.6": {
            "activity": "Concrete Patching (up to 14 sq. ft.)",
            "recommendedActivities": {
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.5": {
                "activity": "12-Inch Concrete Pile Installation"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              },
              "6.5.9": {
                "activity": "Helical Post Installation"
              }
            }
          },
          "6.5.7": {
            "activity": "Concrete Step Installation",
            "recommendedActivities": {
              "6.5.2": {
                "activity": "Foundation Backfilling"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              },
              "6.5.6": {
                "activity": "Concrete Patching (up to 14 sq. ft.)"
              },
              "6.5.9": {
                "activity": "Helical Post Installation"
              }
            }
          },
          "6.5.8": {
            "activity": "6-Inch Suspended Concrete Slab Installation",
            "recommendedActivities": {
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.5": {
                "activity": "12-Inch Concrete Pile Installation"
              },
              "6.5.7": {
                "activity": "Concrete Step Installation"
              },
              "6.5.9": {
                "activity": "Helical Post Installation"
              }
            }
          },
          "6.5.9": {
            "activity": "Helical Post Installation",
            "recommendedActivities": {
              "6.5.1": {
                "activity": "Building Foundation Excavation"
              },
              "6.5.3": {
                "activity": "Concrete Wall Installation"
              },
              "6.5.4": {
                "activity": "Concrete Column Installation"
              },
              "6.5.8": {
                "activity": "6-Inch Suspended Concrete Slab Installation"
              },
              "6.5.7": {
                "activity": "Concrete Step Installation"
              }
            }
          }
        }
      },
      "6.6": {
        "category": "Doors",
        "activities": {
          "6.6.1": {
            "activity": "Interior Door Removal",
            "recommendedActivities": {
              "6.6.2": {
                "activity": "Interior Door Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "3.5.1": {
                "activity": "White Door Painting (One Side)"
              },
              "3.4.2": {
                "activity": "Color Trim and Molding Painting (Two Coats)"
              }
            }
          },
          "6.6.2": {
            "activity": "Interior Door Installation",
            "recommendedActivities": {
              "6.6.1": {
                "activity": "Interior Door Removal"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "3.5.1": {
                "activity": "White Door Painting (One Side)"
              },
              "6.6.6": {
                "activity": "Pocket Door Installation"
              },
              "6.6.5": {
                "activity": "Barn Door Installation"
              }
            }
          },
          "6.6.3": {
            "activity": "Exterior Door Installation",
            "recommendedActivities": {
              "6.6.4": {
                "activity": "Patio Door Installation"
              },
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "3.5.4": {
                "activity": "Color Door Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "6.6.4": {
            "activity": "Patio Door Installation",
            "recommendedActivities": {
              "6.6.3": {
                "activity": "Exterior Door Installation"
              },
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.5": {
                "activity": "Barn Door Installation"
              }
            }
          },
          "6.6.5": {
            "activity": "Barn Door Installation",
            "recommendedActivities": {
              "6.6.6": {
                "activity": "Pocket Door Installation"
              },
              "6.6.2": {
                "activity": "Interior Door Installation"
              },
              "6.6.7": {
                "activity": "Sliding Closet Door Installation"
              },
              "6.6.3": {
                "activity": "Exterior Door Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              }
            }
          },
          "6.6.6": {
            "activity": "Pocket Door Installation",
            "recommendedActivities": {
              "6.6.5": {
                "activity": "Barn Door Installation"
              },
              "6.6.7": {
                "activity": "Sliding Closet Door Installation"
              },
              "6.6.2": {
                "activity": "Interior Door Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "3.5.3": {
                "activity": "Color Door Painting (One Side)"
              }
            }
          },
          "6.6.7": {
            "activity": "Sliding Closet Door Installation",
            "recommendedActivities": {
              "6.6.6": {
                "activity": "Pocket Door Installation"
              },
              "6.6.5": {
                "activity": "Barn Door Installation"
              },
              "6.6.2": {
                "activity": "Interior Door Installation"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "3.5.4": {
                "activity": "Color Door Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "6.6.8": {
            "activity": "8-9 Foot Garage Door Installation",
            "recommendedActivities": {
              "6.6.9": {
                "activity": "16 Foot Garage Door Installation"
              },
              "6.6.10": {
                "activity": "Garage Door Repair"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              }
            }
          },
          "6.6.9": {
            "activity": "16 Foot Garage Door Installation",
            "recommendedActivities": {
              "6.6.8": {
                "activity": "8-9 Foot Garage Door Installation"
              },
              "6.6.10": {
                "activity": "Garage Door Repair"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              }
            }
          },
          "6.6.10": {
            "activity": "Garage Door Repair",
            "recommendedActivities": {
              "6.6.8": {
                "activity": "8-9 Foot Garage Door Installation"
              },
              "6.6.9": {
                "activity": "16 Foot Garage Door Installation"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              }
            }
          },
          "6.6.11": {
            "activity": "Cat Door Installation",
            "recommendedActivities": {
              "6.6.12": {
                "activity": "Dog Door Installation"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.3": {
                "activity": "Exterior Door Installation"
              },
              "6.6.4": {
                "activity": "Patio Door Installation"
              },
              "6.6.2": {
                "activity": "Interior Door Installation"
              }
            }
          },
          "6.6.12": {
            "activity": "Dog Door Installation",
            "recommendedActivities": {
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.13": {
                "activity": "Pet and Dog Patio Door Installation"
              },
              "6.6.3": {
                "activity": "Exterior Door Installation"
              },
              "6.6.4": {
                "activity": "Patio Door Installation"
              },
              "6.6.2": {
                "activity": "Interior Door Installation"
              }
            }
          },
          "6.6.13": {
            "activity": "Pet and Dog Patio Door Installation",
            "recommendedActivities": {
              "6.6.11": {
                "activity": "Cat Door Installation"
              },
              "6.6.12": {
                "activity": "Dog Door Installation"
              },
              "6.6.4": {
                "activity": "Patio Door Installation"
              },
              "6.6.3": {
                "activity": "Exterior Door Installation"
              },
              "6.6.10": {
                "activity": "Garage Door Repair"
              }
            }
          }
        }
      },
      "6.7": {
        "category": "Windows",
        "activities": {
          "6.7.1": {
            "activity": "Window Reglazing (up to 24x36 inches)",
            "recommendedActivities": {
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "3.6.1": {
                "activity": "White Window Painting (One Side)"
              },
              "3.6.5": {
                "activity": "Window Staining and Finishing (One Side, Jamb, and Trim)"
              }
            }
          },
          "6.7.2": {
            "activity": "Aluminum Window Installation (up to 40 square feet)",
            "recommendedActivities": {
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "6.7.5": {
                "activity": "Glass Block Window Installation"
              },
              "3.6.1": {
                "activity": "White Window Painting (One Side)"
              }
            }
          },
          "6.7.3": {
            "activity": "Vinyl Window Installation (up to 40 square feet)",
            "recommendedActivities": {
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "6.7.7": {
                "activity": "Skylight Installation"
              },
              "3.6.2": {
                "activity": "White Window Painting (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "6.7.4": {
            "activity": "Wood Window Installation (up to 40 square feet)",
            "recommendedActivities": {
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.5": {
                "activity": "Glass Block Window Installation"
              },
              "3.6.5": {
                "activity": "Window Staining and Finishing (One Side, Jamb, and Trim)"
              }
            }
          },
          "6.7.5": {
            "activity": "Glass Block Window Installation",
            "recommendedActivities": {
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "3.6.6": {
                "activity": "Window Staining and Finishing (Two Sides, Jamb, and Trim)"
              }
            }
          },
          "6.7.6": {
            "activity": "Window Removal",
            "recommendedActivities": {
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "6.7.5": {
                "activity": "Glass Block Window Installation"
              },
              "6.7.7": {
                "activity": "Skylight Installation"
              }
            }
          },
          "6.7.7": {
            "activity": "Skylight Installation",
            "recommendedActivities": {
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.8": {
                "activity": "Raised Panel Shutters Installation"
              }
            }
          },
          "6.7.8": {
            "activity": "Raised Panel Shutters Installation",
            "recommendedActivities": {
              "6.7.2": {
                "activity": "Aluminum Window Installation (up to 40 square feet)"
              },
              "6.7.3": {
                "activity": "Vinyl Window Installation (up to 40 square feet)"
              },
              "6.7.4": {
                "activity": "Wood Window Installation (up to 40 square feet)"
              },
              "6.7.6": {
                "activity": "Window Removal"
              },
              "6.7.7": {
                "activity": "Skylight Installation"
              }
            }
          }
        }
      },
      "6.8": {
        "category": "Stairs",
        "activities": {
          "6.8.1": {
            "activity": "Unfinished Stringers, Treads & Risers Installation",
            "recommendedActivities": {
              "6.8.2": {
                "activity": "Prefinished Treads & Steel Stringers Installation"
              },
              "6.8.4": {
                "activity": "Stair Treads and Risers Replacement"
              },
              "6.8.3": {
                "activity": "Staircase Removal"
              },
              "6.8.6": {
                "activity": "Handrail Installation"
              },
              "6.2.1": {
                "activity": "Baseboard Installation"
              }
            }
          },
          "6.8.2": {
            "activity": "Prefinished Treads & Steel Stringers Installation",
            "recommendedActivities": {
              "6.8.1": {
                "activity": "Unfinished Stringers, Treads & Risers Installation"
              },
              "6.8.4": {
                "activity": "Stair Treads and Risers Replacement"
              },
              "6.8.6": {
                "activity": "Handrail Installation"
              },
              "6.8.3": {
                "activity": "Staircase Removal"
              },
              "6.8.5": {
                "activity": "Spiral Staircase Installation"
              }
            }
          },
          "6.8.3": {
            "activity": "Staircase Removal",
            "recommendedActivities": {
              "6.8.1": {
                "activity": "Unfinished Stringers, Treads & Risers Installation"
              },
              "6.8.2": {
                "activity": "Prefinished Treads & Steel Stringers Installation"
              },
              "6.8.4": {
                "activity": "Stair Treads and Risers Replacement"
              },
              "6.8.5": {
                "activity": "Spiral Staircase Installation"
              },
              "6.8.6": {
                "activity": "Handrail Installation"
              }
            }
          },
          "6.8.4": {
            "activity": "Stair Treads and Risers Replacement",
            "recommendedActivities": {
              "6.8.2": {
                "activity": "Prefinished Treads & Steel Stringers Installation"
              },
              "6.8.6": {
                "activity": "Handrail Installation"
              },
              "6.8.1": {
                "activity": "Unfinished Stringers, Treads & Risers Installation"
              },
              "6.8.3": {
                "activity": "Staircase Removal"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          },
          "6.8.5": {
            "activity": "Spiral Staircase Installation",
            "recommendedActivities": {
              "6.8.4": {
                "activity": "Stair Treads and Risers Replacement"
              },
              "6.8.3": {
                "activity": "Staircase Removal"
              },
              "6.8.6": {
                "activity": "Handrail Installation"
              },
              "6.8.1": {
                "activity": "Unfinished Stringers, Treads & Risers Installation"
              },
              "6.8.2": {
                "activity": "Prefinished Treads & Steel Stringers Installation"
              }
            }
          },
          "6.8.6": {
            "activity": "Handrail Installation",
            "recommendedActivities": {
              "6.8.4": {
                "activity": "Stair Treads and Risers Replacement"
              },
              "6.8.5": {
                "activity": "Spiral Staircase Installation"
              },
              "6.8.2": {
                "activity": "Prefinished Treads & Steel Stringers Installation"
              },
              "6.8.1": {
                "activity": "Unfinished Stringers, Treads & Risers Installation"
              },
              "5.7.1": {
                "activity": "Wood Floor Sanding, Staining, and Finishing"
              }
            }
          }
        }
      },
      "6.9": {
        "category": "Wood Paneling",
        "activities": {
          "6.9.1": {
            "activity": "Overlapping Wainscot Installation",
            "recommendedActivities": {
              "6.9.2": {
                "activity": "Beadboard Panel Installation"
              },
              "6.9.3": {
                "activity": "Shiplap Board Installation"
              },
              "6.9.5": {
                "activity": "Wood Panel Removal"
              },
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "3.4.3": {
                "activity": "Trim and Molding Staining and Finishing"
              }
            }
          },
          "6.9.2": {
            "activity": "Beadboard Panel Installation",
            "recommendedActivities": {
              "6.9.1": {
                "activity": "Overlapping Wainscot Installation"
              },
              "6.9.3": {
                "activity": "Shiplap Board Installation"
              },
              "6.9.4": {
                "activity": "Decorative Panels Installation"
              },
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "3.4.1": {
                "activity": "White Trim and Molding Painting (One Coat Refresh)"
              }
            }
          },
          "6.9.3": {
            "activity": "Shiplap Board Installation",
            "recommendedActivities": {
              "6.9.2": {
                "activity": "Beadboard Panel Installation"
              },
              "6.9.4": {
                "activity": "Decorative Panels Installation"
              },
              "6.9.5": {
                "activity": "Wood Panel Removal"
              },
              "6.2.2": {
                "activity": "Casing Installation"
              },
              "3.1.3": {
                "activity": "Color Wall Painting (Two Coats)"
              }
            }
          },
          "6.9.4": {
            "activity": "Decorative Panels Installation",
            "recommendedActivities": {
              "6.9.1": {
                "activity": "Overlapping Wainscot Installation"
              },
              "6.9.3": {
                "activity": "Shiplap Board Installation"
              },
              "6.2.4": {
                "activity": "Crown Molding Installation"
              },
              "3.1.7": {
                "activity": "Wall Staining and Finishing"
              },
              "6.9.5": {
                "activity": "Wood Panel Removal"
              }
            }
          },
          "6.9.5": {
            "activity": "Wood Panel Removal",
            "recommendedActivities": {
              "6.9.1": {
                "activity": "Overlapping Wainscot Installation"
              },
              "6.9.2": {
                "activity": "Beadboard Panel Installation"
              },
              "6.9.3": {
                "activity": "Shiplap Board Installation"
              },
              "6.2.1": {
                "activity": "Baseboard Installation"
              },
              "3.1.3": {
                "activity": "Color Wall Painting (Two Coats)"
              }
            }
          }
        }
      },
      "6.10": {
        "category": "Countertop",
        "activities": {
          "6.10.1": {
            "activity": "Butcher Block Countertop Installation",
            "recommendedActivities": {
              "6.10.2": {
                "activity": "Butcher Block Countertop Restoration"
              },
              "6.10.5": {
                "activity": "Countertop Subdeck Installation"
              },
              "6.10.6": {
                "activity": "Countertop Removal"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              }
            }
          },
          "6.10.2": {
            "activity": "Butcher Block Countertop Restoration",
            "recommendedActivities": {
              "6.10.1": {
                "activity": "Butcher Block Countertop Installation"
              },
              "6.10.3": {
                "activity": "Natural Stone Countertop Restoration"
              },
              "6.10.6": {
                "activity": "Countertop Removal"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.3": {
                "activity": "Natural Stone Countertop Installation"
              }
            }
          },
          "6.10.3": {
            "activity": "Natural Stone Countertop Restoration",
            "recommendedActivities": {
              "6.10.1": {
                "activity": "Butcher Block Countertop Installation"
              },
              "6.10.2": {
                "activity": "Butcher Block Countertop Restoration"
              },
              "6.10.6": {
                "activity": "Countertop Removal"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.3.8": {
                "activity": "Natural Stone Mosaic Installation"
              }
            }
          },
          "6.10.4": {
            "activity": "Laminate Countertop Installation",
            "recommendedActivities": {
              "6.10.5": {
                "activity": "Countertop Subdeck Installation"
              },
              "6.10.6": {
                "activity": "Countertop Removal"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.3.4": {
                "activity": "Natural Stone Sill Installation"
              },
              "4.3.5": {
                "activity": "Natural Stone Threshold Installation"
              }
            }
          },
          "6.10.5": {
            "activity": "Countertop Subdeck Installation",
            "recommendedActivities": {
              "6.10.1": {
                "activity": "Butcher Block Countertop Installation"
              },
              "6.10.4": {
                "activity": "Laminate Countertop Installation"
              },
              "6.10.6": {
                "activity": "Countertop Removal"
              },
              "4.3.6": {
                "activity": "Natural Stone Countertop Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              }
            }
          },
          "6.10.6": {
            "activity": "Countertop Removal",
            "recommendedActivities": {
              "6.10.1": {
                "activity": "Butcher Block Countertop Installation"
              },
              "6.10.4": {
                "activity": "Laminate Countertop Installation"
              },
              "4.6.2": {
                "activity": "Tile Backsplash Installation"
              },
              "4.6.1": {
                "activity": "Countertop Tile Installation"
              },
              "6.10.5": {
                "activity": "Countertop Subdeck Installation"
              }
            }
          }
        }
      }
    }
  },
  "7": {
    "section": "HVAC",
    "categories": {
      "7.1": {
        "category": "Furnace",
        "activities": {
          "7.1.1": {
            "activity": "Furnace Removal",
            "recommendedActivities": {
              "7.1.2": {
                "activity": "Furnace Installation"
              },
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              },
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              },
              "7.2.1": {
                "activity": "Thermostat Installation"
              }
            }
          },
          "7.1.2": {
            "activity": "Furnace Installation",
            "recommendedActivities": {
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              },
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              },
              "7.2.1": {
                "activity": "Thermostat Installation"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              }
            }
          },
          "7.1.3": {
            "activity": "Furnace Cleaning, Servicing, and Filter Replacement",
            "recommendedActivities": {
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              },
              "7.1.6": {
                "activity": "Burner Replacement"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              },
              "7.4.2": {
                "activity": "Humidifier Installation"
              }
            }
          },
          "7.1.4": {
            "activity": "Furnace Ignitor Replacement",
            "recommendedActivities": {
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              },
              "7.1.5": {
                "activity": "Heat Exchanger Replacement"
              },
              "7.1.7": {
                "activity": "Control Board Replacement"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              }
            }
          },
          "7.1.5": {
            "activity": "Heat Exchanger Replacement",
            "recommendedActivities": {
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.6": {
                "activity": "Burner Replacement"
              },
              "7.1.7": {
                "activity": "Control Board Replacement"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              }
            }
          },
          "7.1.6": {
            "activity": "Burner Replacement",
            "recommendedActivities": {
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              },
              "7.1.5": {
                "activity": "Heat Exchanger Replacement"
              },
              "7.1.7": {
                "activity": "Control Board Replacement"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              }
            }
          },
          "7.1.7": {
            "activity": "Control Board Replacement",
            "recommendedActivities": {
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.5": {
                "activity": "Heat Exchanger Replacement"
              },
              "7.1.6": {
                "activity": "Burner Replacement"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              },
              "7.2.1": {
                "activity": "Thermostat Installation"
              }
            }
          },
          "7.1.8": {
            "activity": "Routine Furnace Maintenance",
            "recommendedActivities": {
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              },
              "7.1.4": {
                "activity": "Furnace Ignitor Replacement"
              },
              "7.1.6": {
                "activity": "Burner Replacement"
              },
              "7.1.7": {
                "activity": "Control Board Replacement"
              },
              "7.3.1": {
                "activity": "Duct Cleaning"
              }
            }
          }
        }
      },
      "7.2": {
        "category": "Boiler",
        "activities": {
          "7.2.1": {
            "activity": "Boiler Removal",
            "recommendedActivities": {
              "7.2.2": {
                "activity": "Gas Boiler Installation"
              },
              "7.2.3": {
                "activity": "Electric Boiler Installation"
              },
              "7.2.4": {
                "activity": "Boiler Regular Maintenance"
              }
            }
          },
          "7.2.2": {
            "activity": "Gas Boiler Installation",
            "recommendedActivities": {
              "7.2.4": {
                "activity": "Boiler Regular Maintenance"
              },
              "7.2.1": {
                "activity": "Boiler Removal"
              }
            }
          },
          "7.2.3": {
            "activity": "Electric Boiler Installation",
            "recommendedActivities": {
              "7.2.4": {
                "activity": "Boiler Regular Maintenance"
              },
              "7.2.1": {
                "activity": "Boiler Removal"
              }
            }
          },
          "7.2.4": {
            "activity": "Boiler Regular Maintenance",
            "recommendedActivities": {
              "7.2.1": {
                "activity": "Boiler Removal"
              },
              "7.2.2": {
                "activity": "Gas Boiler Installation"
              },
              "7.2.3": {
                "activity": "Electric Boiler Installation"
              }
            }
          }
        }
      },
      "7.3": {
        "category": "Heat Pump",
        "activities": {
          "7.3.1": {
            "activity": "Heat Pump Removal",
            "recommendedActivities": {
              "7.3.2": {
                "activity": "Heat Pump Installation"
              },
              "7.3.4": {
                "activity": "Heat Pump Regular Maintenance"
              },
              "7.1.3": {
                "activity": "Furnace Cleaning, Servicing, and Filter Replacement"
              }
            }
          },
          "7.3.2": {
            "activity": "Heat Pump Installation",
            "recommendedActivities": {
              "7.3.4": {
                "activity": "Heat Pump Regular Maintenance"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              },
              "7.1.2": {
                "activity": "Furnace Installation"
              }
            }
          },
          "7.3.3": {
            "activity": "Heat Pump Diagnostic and Troubleshooting",
            "recommendedActivities": {
              "7.3.5": {
                "activity": "Heat Pump Refrigerant Recharge and Leak Repair"
              },
              "7.3.6": {
                "activity": "Heat Pump Component Replacement and Repair"
              },
              "7.3.4": {
                "activity": "Heat Pump Regular Maintenance"
              }
            }
          },
          "7.3.4": {
            "activity": "Heat Pump Regular Maintenance",
            "recommendedActivities": {
              "7.3.2": {
                "activity": "Heat Pump Installation"
              },
              "7.3.3": {
                "activity": "Heat Pump Diagnostic and Troubleshooting"
              },
              "7.1.8": {
                "activity": "Routine Furnace Maintenance"
              }
            }
          },
          "7.3.5": {
            "activity": "Heat Pump Refrigerant Recharge and Leak Repair",
            "recommendedActivities": {
              "7.3.3": {
                "activity": "Heat Pump Diagnostic and Troubleshooting"
              },
              "7.3.6": {
                "activity": "Heat Pump Component Replacement and Repair"
              },
              "7.3.4": {
                "activity": "Heat Pump Regular Maintenance"
              }
            }
          },
          "7.3.6": {
            "activity": "Heat Pump Component Replacement and Repair",
            "recommendedActivities": {
              "7.3.3": {
                "activity": "Heat Pump Diagnostic and Troubleshooting"
              },
              "7.3.5": {
                "activity": "Heat Pump Refrigerant Recharge and Leak Repair"
              },
              "7.3.4": {
                "activity": "Heat Pump Regular Maintenance"
              }
            }
          }
        }
      },
      "7.4": {
        "category": "Mini Split AC",
        "activities": {
          "7.4.1": {
            "activity": "Mini Split Air Conditioner Removal",
            "recommendedActivities": {
              "7.4.2": {
                "activity": "Mini Split Air Conditioner Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "3.5.1": {
                "activity": "Wall Repair and Repainting"
              }
            }
          },
          "7.4.2": {
            "activity": "Mini Split Air Conditioner Installation",
            "recommendedActivities": {
              "7.4.1": {
                "activity": "Mini Split Air Conditioner Removal"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "19.8.4": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          },
          "7.4.3": {
            "activity": "2 Zone Mini Split Air Conditioner Installation",
            "recommendedActivities": {
              "7.4.6": {
                "activity": "Mini Split Air Conditioner Routine Maintenance"
              },
              "10.2.3": {
                "activity": "Backyard Outlet with Switch Installation"
              }
            }
          },
          "7.4.4": {
            "activity": "3 Zone Mini Split Air Conditioner Installation",
            "recommendedActivities": {
              "7.4.6": {
                "activity": "Mini Split Air Conditioner Routine Maintenance"
              },
              "10.2.3": {
                "activity": "Backyard Outlet with Switch Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              }
            }
          },
          "7.4.5": {
            "activity": "Mini Split Air Conditioner Diagnostics and Troubleshooting",
            "recommendedActivities": {
              "7.4.7": {
                "activity": "Mini Split Air Conditioner Refrigerant Management"
              },
              "7.4.6": {
                "activity": "Mini Split Air Conditioner Routine Maintenance"
              }
            }
          },
          "7.4.6": {
            "activity": "Mini Split Air Conditioner Routine Maintenance",
            "recommendedActivities": {
              "7.4.7": {
                "activity": "Mini Split Air Conditioner Refrigerant Management"
              },
              "11.7.1": {
                "activity": "Roof Soft Washing"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          },
          "7.4.7": {
            "activity": "Mini Split Air Conditioner Refrigerant Management",
            "recommendedActivities": {
              "7.4.6": {
                "activity": "Mini Split Air Conditioner Routine Maintenance"
              },
              "10.10.3": {
                "activity": "Outdoor Electrical Wiring Maintenance"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              }
            }
          }
        }
      },
      "7.5": {
        "category": "Window AC",
        "activities": {
          "7.5.1": {
            "activity": "Window AC Removal",
            "recommendedActivities": {
              "7.5.2": {
                "activity": "Window AC Installation"
              },
              "3.5.1": {
                "activity": "Wall Repair and Repainting"
              },
              "8.4.1": {
                "activity": "Window Trim & Jamb Painting"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              }
            }
          },
          "7.5.2": {
            "activity": "Window AC Installation",
            "recommendedActivities": {
              "7.5.3": {
                "activity": "Window AC Routine Maintenance"
              },
              "7.5.4": {
                "activity": "Window AC Diagnostic and Troubleshooting"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "8.4.2": {
                "activity": "Window Trim and Jamb Staining and Finishing"
              }
            }
          },
          "7.5.3": {
            "activity": "Window AC Routine Maintenance",
            "recommendedActivities": {
              "7.5.4": {
                "activity": "Window AC Diagnostic and Troubleshooting"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "11.7.1": {
                "activity": "Roof Soft Washing"
              }
            }
          },
          "7.5.4": {
            "activity": "Window AC Diagnostic and Troubleshooting",
            "recommendedActivities": {
              "7.5.3": {
                "activity": "Window AC Routine Maintenance"
              },
              "7.5.2": {
                "activity": "Window AC Installation"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "10.10.2": {
                "activity": "Outdoor Electrical Troubleshooting and Emergency Repairs"
              }
            }
          }
        }
      },
      "7.6": {
        "category": "Ventilation System",
        "activities": {
          "7.6.1": {
            "activity": "Bathroom Ventilation Fan Removal",
            "recommendedActivities": {
              "7.6.2": {
                "activity": "Bathroom Ventilation Fan Installation"
              },
              "7.6.3": {
                "activity": "Bathroom Ventilation Fan Replacement"
              },
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              },
              "3.5.1": {
                "activity": "Wall Repair and Repainting"
              }
            }
          },
          "7.6.2": {
            "activity": "Bathroom Ventilation Fan Installation",
            "recommendedActivities": {
              "7.6.3": {
                "activity": "Bathroom Ventilation Fan Replacement"
              },
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              },
              "7.6.7": {
                "activity": "Ventilation System Vibration and Noise Reduction"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              }
            }
          },
          "7.6.3": {
            "activity": "Bathroom Ventilation Fan Replacement",
            "recommendedActivities": {
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              },
              "7.6.5": {
                "activity": "Ventilation System Motor and Belt Replacement"
              },
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              }
            }
          },
          "7.6.4": {
            "activity": "Ventilation System Duct Cleaning and Maintenance",
            "recommendedActivities": {
              "7.6.5": {
                "activity": "Ventilation System Motor and Belt Replacement"
              },
              "7.6.7": {
                "activity": "Ventilation System Vibration and Noise Reduction"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "7.6.5": {
            "activity": "Ventilation System Motor and Belt Replacement",
            "recommendedActivities": {
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              },
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              },
              "7.6.7": {
                "activity": "Ventilation System Vibration and Noise Reduction"
              }
            }
          },
          "7.6.6": {
            "activity": "Ventilation System Balancing",
            "recommendedActivities": {
              "7.6.5": {
                "activity": "Ventilation System Motor and Belt Replacement"
              },
              "7.6.7": {
                "activity": "Ventilation System Vibration and Noise Reduction"
              },
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              }
            }
          },
          "7.6.7": {
            "activity": "Ventilation System Vibration and Noise Reduction",
            "recommendedActivities": {
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              },
              "7.6.5": {
                "activity": "Ventilation System Motor and Belt Replacement"
              },
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              }
            }
          }
        }
      },
      "7.7": {
        "category": "Ductwork",
        "activities": {
          "7.7.1": {
            "activity": "Hot or Cold Air System Installation",
            "recommendedActivities": {
              "7.7.2": {
                "activity": "Ductwork Removal"
              },
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              }
            }
          },
          "7.7.2": {
            "activity": "Ductwork Removal",
            "recommendedActivities": {
              "7.7.1": {
                "activity": "Hot or Cold Air System Installation"
              },
              "7.6.4": {
                "activity": "Ventilation System Duct Cleaning and Maintenance"
              },
              "3.5.1": {
                "activity": "Wall Repair and Repainting"
              }
            }
          }
        }
      },
      "7.8": {
        "category": "Thermostat",
        "activities": {
          "7.8.1": {
            "activity": "Thermostat Replacement",
            "recommendedActivities": {
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "7.7.1": {
                "activity": "Hot or Cold Air System Installation"
              },
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              }
            }
          },
          "7.8.2": {
            "activity": "Smart Thermostat Installation",
            "recommendedActivities": {
              "7.8.1": {
                "activity": "Thermostat Replacement"
              },
              "7.7.1": {
                "activity": "Hot or Cold Air System Installation"
              },
              "7.6.6": {
                "activity": "Ventilation System Balancing"
              },
              "10.2.3": {
                "activity": "Backyard Outlet with Switch Installation"
              }
            }
          }
        }
      },
      "7.9": {
        "category": "Heater",
        "activities": {
          "7.9.1": {
            "activity": "Baseboard Electric Heater Installation",
            "recommendedActivities": {
              "7.9.2": {
                "activity": "Baseboard Hydronic Heater Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "7.10.1": {
                "activity": "Dehumidifier Installation"
              }
            }
          },
          "7.9.2": {
            "activity": "Baseboard Hydronic Heater Installation",
            "recommendedActivities": {
              "7.9.1": {
                "activity": "Baseboard Electric Heater Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "7.10.4": {
                "activity": "Humidifier/Dehumidifier Maintenance"
              }
            }
          },
          "7.9.3": {
            "activity": "Electric Wall Heater Installation",
            "recommendedActivities": {
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "7.10.2": {
                "activity": "Humidifier Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              }
            }
          },
          "7.9.4": {
            "activity": "Garage Air Heater Installation",
            "recommendedActivities": {
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "7.10.3": {
                "activity": "Air Purifier Installation"
              }
            }
          }
        }
      },
      "7.10": {
        "category": "Air Quality",
        "activities": {
          "7.10.1": {
            "activity": "Dehumidifier Installation",
            "recommendedActivities": {
              "7.10.4": {
                "activity": "Humidifier/Dehumidifier Maintenance"
              },
              "7.10.3": {
                "activity": "Air Purifier Installation"
              },
              "7.9.1": {
                "activity": "Baseboard Electric Heater Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              }
            }
          },
          "7.10.2": {
            "activity": "Humidifier Installation",
            "recommendedActivities": {
              "7.10.4": {
                "activity": "Humidifier/Dehumidifier Maintenance"
              },
              "7.10.3": {
                "activity": "Air Purifier Installation"
              },
              "7.9.3": {
                "activity": "Electric Wall Heater Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              }
            }
          },
          "7.10.3": {
            "activity": "Air Purifier Installation",
            "recommendedActivities": {
              "7.10.1": {
                "activity": "Dehumidifier Installation"
              },
              "7.10.4": {
                "activity": "Humidifier/Dehumidifier Maintenance"
              },
              "7.9.4": {
                "activity": "Garage Air Heater Installation"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              }
            }
          },
          "7.10.4": {
            "activity": "Humidifier/Dehumidifier Maintenance",
            "recommendedActivities": {
              "7.10.1": {
                "activity": "Dehumidifier Installation"
              },
              "7.10.2": {
                "activity": "Humidifier Installation"
              },
              "7.10.3": {
                "activity": "Air Purifier Installation"
              },
              "7.9.2": {
                "activity": "Baseboard Hydronic Heater Installation"
              }
            }
          }
        }
      },
      "7.11": {
        "category": "Freestanding Stoves",
        "activities": {
          "7.11.1": {
            "activity": "Electric Stove Installation",
            "recommendedActivities": {
              "7.11.5": {
                "activity": "Chimney Sweeping for Stoves"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "7.12.1": {
                "activity": "Electric Fireplace Installation"
              }
            }
          },
          "7.11.2": {
            "activity": "Gas Stove Installation",
            "recommendedActivities": {
              "7.11.5": {
                "activity": "Chimney Sweeping for Stoves"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "7.12.2": {
                "activity": "Gas Fireplace (Ventless) Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          },
          "7.11.3": {
            "activity": "Wood Burning Stove Installation",
            "recommendedActivities": {
              "7.11.5": {
                "activity": "Chimney Sweeping for Stoves"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "7.12.3": {
                "activity": "Fireplace Removal"
              }
            }
          },
          "7.11.4": {
            "activity": "Pellet Stove Installation",
            "recommendedActivities": {
              "7.11.5": {
                "activity": "Chimney Sweeping for Stoves"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "7.12.2": {
                "activity": "Gas Fireplace (Ventless) Installation"
              }
            }
          },
          "7.11.5": {
            "activity": "Chimney Sweeping for Stoves",
            "recommendedActivities": {
              "7.11.3": {
                "activity": "Wood Burning Stove Installation"
              },
              "7.11.4": {
                "activity": "Pellet Stove Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.4.1": {
                "activity": "Tile Roof Repair"
              }
            }
          }
        }
      },
      "7.12": {
        "category": "Fireplaces",
        "activities": {
          "7.12.1": {
            "activity": "Electric Fireplace Installation",
            "recommendedActivities": {
              "7.11.1": {
                "activity": "Electric Stove Installation"
              },
              "7.8.2": {
                "activity": "Smart Thermostat Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          },
          "7.12.2": {
            "activity": "Gas Fireplace (Ventless) Installation",
            "recommendedActivities": {
              "7.11.2": {
                "activity": "Gas Stove Installation"
              },
              "7.11.5": {
                "activity": "Chimney Sweeping for Stoves"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "7.12.3": {
            "activity": "Fireplace Removal",
            "recommendedActivities": {
              "7.11.3": {
                "activity": "Wood Burning Stove Installation"
              },
              "7.11.4": {
                "activity": "Pellet Stove Installation"
              },
              "3.5.1": {
                "activity": "Wall Repair and Repainting"
              },
              "7.12.1": {
                "activity": "Electric Fireplace Installation"
              }
            }
          }
        }
      }
    }
  },
  "12": {
    "section": "Cleaning",
    "categories": {
      "12.1": {
        "category": "Regular Cleaning",
        "activities": {
          "12.1.1": {
            "activity": "1BED/1BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.1": {
                "activity": "1BED/1BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.1.2": {
            "activity": "2BED/1BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.2": {
                "activity": "2BED/1BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.1.3": {
            "activity": "2BED/2BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.3": {
                "activity": "2BED/2BATH General Cleaning"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.1.4": {
            "activity": "3BED/2BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.4": {
                "activity": "3BED/2BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.1.5": {
            "activity": "3BED/3BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.5": {
                "activity": "3BED/3BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.1.6": {
            "activity": "4BED/3BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.6": {
                "activity": "4BED/3BATH General Cleaning"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.1.7": {
            "activity": "4BED/4BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.7": {
                "activity": "4BED/4BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.1.8": {
            "activity": "4BED/5BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.8": {
                "activity": "4BED/5BATH General Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.1.9": {
            "activity": "5BED/5BATH Regular Cleaning",
            "recommendedActivities": {
              "12.2.9": {
                "activity": "5BED/5BATH General Cleaning"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          }
        }
      },
      "12.2": {
        "category": "General Cleaning",
        "activities": {
          "12.2.1": {
            "activity": "1BED/1BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.2.2": {
            "activity": "2BED/1BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.2.3": {
            "activity": "2BED/2BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.2.4": {
            "activity": "3BED/2BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.2.5": {
            "activity": "3BED/3BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.2.6": {
            "activity": "4BED/3BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.2.7": {
            "activity": "4BED/4BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.2.8": {
            "activity": "4BED/5BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.2.9": {
            "activity": "5BED/5BATH General Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          }
        }
      },
      "12.3": {
        "category": "Specialized",
        "activities": {
          "12.3.1": {
            "activity": "Fireplace Chimney Sweep Cleaning and Service",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.3.2": {
            "activity": "Heavy Stain Carpet Cleaning and Deodorizing",
            "recommendedActivities": {
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.3.3": {
            "activity": "Carpet Stairs Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.3.4": {
            "activity": "Tile - Heavy Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.3.5": {
            "activity": "Natural Marble - Heavy Cleaning",
            "recommendedActivities": {
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          }
        }
      },
      "12.4": {
        "category": "Windows",
        "activities": {
          "12.4.1": {
            "activity": "Window Cleaning (per side) 41 - 60 SF",
            "recommendedActivities": {
              "12.4.2": {
                "activity": "Window Cleaning (Per Side) 41 - 60 SF"
              },
              "12.4.3": {
                "activity": "Window Screen Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "12.4.2": {
            "activity": "Window Cleaning (Per Side) 41 - 60 SF",
            "recommendedActivities": {
              "12.4.1": {
                "activity": "Window Cleaning (per side) 41 - 60 SF"
              },
              "12.4.3": {
                "activity": "Window Screen Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "12.4.3": {
            "activity": "Window Screen Cleaning",
            "recommendedActivities": {
              "12.4.1": {
                "activity": "Window Cleaning (per side) 41 - 60 SF"
              },
              "12.4.2": {
                "activity": "Window Cleaning (Per Side) 41 - 60 SF"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              }
            }
          }
        }
      },
      "12.5": {
        "category": "Janitorial",
        "activities": {
          "12.5.1": {
            "activity": "Office Cleaning",
            "recommendedActivities": {
              "12.5.2": {
                "activity": "Retail Store Cleaning"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              },
              "12.4.3": {
                "activity": "Window Screen Cleaning"
              }
            }
          },
          "12.5.2": {
            "activity": "Retail Store Cleaning",
            "recommendedActivities": {
              "12.5.1": {
                "activity": "Office Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              },
              "12.4.1": {
                "activity": "Window Cleaning (per side) 41 - 60 SF"
              }
            }
          }
        }
      },
      "12.6": {
        "category": "Post-Event",
        "activities": {
          "12.6.1": {
            "activity": "Post Corporate Event Cleaning",
            "recommendedActivities": {
              "12.6.2": {
                "activity": "Post-Wedding Cleaning"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              }
            }
          },
          "12.6.2": {
            "activity": "Post-Wedding Cleaning",
            "recommendedActivities": {
              "12.6.1": {
                "activity": "Post Corporate Event Cleaning"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              },
              "12.7.2": {
                "activity": "Fire and Smoke Damage Cleanup"
              }
            }
          },
          "12.6.3": {
            "activity": "Final Cleaning after Construction",
            "recommendedActivities": {
              "12.6.1": {
                "activity": "Post Corporate Event Cleaning"
              },
              "12.6.2": {
                "activity": "Post-Wedding Cleaning"
              },
              "12.8.1": {
                "activity": "Chemical Spill Cleanup"
              }
            }
          }
        }
      },
      "12.7": {
        "category": "Emergency",
        "activities": {
          "12.7.1": {
            "activity": "Flood Damage Cleanup",
            "recommendedActivities": {
              "12.7.2": {
                "activity": "Fire and Smoke Damage Cleanup"
              },
              "12.8.2": {
                "activity": "Crime Scene Cleanup"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "12.7.2": {
            "activity": "Fire and Smoke Damage Cleanup",
            "recommendedActivities": {
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              },
              "12.8.2": {
                "activity": "Crime Scene Cleanup"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "12.8": {
        "category": "Biohazard",
        "activities": {
          "12.8.1": {
            "activity": "Chemical Spill Cleanup",
            "recommendedActivities": {
              "12.8.2": {
                "activity": "Crime Scene Cleanup"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "12.8.2": {
            "activity": "Crime Scene Cleanup",
            "recommendedActivities": {
              "12.8.1": {
                "activity": "Chemical Spill Cleanup"
              },
              "12.7.2": {
                "activity": "Fire and Smoke Damage Cleanup"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      }
    }
  },
  "13": {
    "section": "Wall and Ceiling",
    "categories": {
      "13.1": {
        "category": "Drywall Repair",
        "activities": {
          "13.1.1": {
            "activity": "Drywall Repair (Up to 4 Square Feet)",
            "recommendedActivities": {
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "3.4.2": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "13.1.2": {
            "activity": "Drywall Repair (Holes & Cracks Up to 3 Inches)",
            "recommendedActivities": {
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "3.4.2": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "13.1.3": {
            "activity": "Corner Bead Repair",
            "recommendedActivities": {
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "3.4.2": {
                "activity": "Baseboard Painting"
              }
            }
          },
          "13.1.4": {
            "activity": "Drywall Cracks Repair",
            "recommendedActivities": {
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              }
            }
          }
        }
      },
      "13.2": {
        "category": "Texture Drywall",
        "activities": {
          "13.2.1": {
            "activity": "Machine Texturing for Drywall",
            "recommendedActivities": {
              "13.2.2": {
                "activity": "Heavy Hand Texturing for Drywall"
              },
              "13.2.3": {
                "activity": "Skim Coat for Drywall"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.2.2": {
            "activity": "Heavy Hand Texturing for Drywall",
            "recommendedActivities": {
              "13.2.1": {
                "activity": "Machine Texturing for Drywall"
              },
              "13.2.3": {
                "activity": "Skim Coat for Drywall"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.2.3": {
            "activity": "Skim Coat for Drywall",
            "recommendedActivities": {
              "13.2.1": {
                "activity": "Machine Texturing for Drywall"
              },
              "13.2.2": {
                "activity": "Heavy Hand Texturing for Drywall"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              }
            }
          }
        }
      },
      "13.3": {
        "category": "Acoustic Drywall",
        "activities": {
          "13.3.1": {
            "activity": "Acoustic Drywall Installation",
            "recommendedActivities": {
              "13.3.2": {
                "activity": "Drop Ceiling Tiles Installation (Acoustic Improvement)"
              },
              "13.3.4": {
                "activity": "Acoustical/Fire-Safing 4-Inch Insulation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.3.2": {
            "activity": "Drop Ceiling Tiles Installation (Acoustic Improvement)",
            "recommendedActivities": {
              "13.3.1": {
                "activity": "Acoustic Drywall Installation"
              },
              "13.3.3": {
                "activity": "Drop Ceiling Tiles Repair and Painting"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              }
            }
          },
          "13.3.3": {
            "activity": "Drop Ceiling Tiles Repair and Painting",
            "recommendedActivities": {
              "13.3.2": {
                "activity": "Drop Ceiling Tiles Installation (Acoustic Improvement)"
              },
              "13.3.4": {
                "activity": "Acoustical/Fire-Safing 4-Inch Insulation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.3.4": {
            "activity": "Acoustical/Fire-Safing 4-Inch Insulation",
            "recommendedActivities": {
              "13.3.1": {
                "activity": "Acoustic Drywall Installation"
              },
              "13.3.3": {
                "activity": "Drop Ceiling Tiles Repair and Painting"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              }
            }
          }
        }
      },
      "13.4": {
        "category": "Drywall Installation",
        "activities": {
          "13.4.1": {
            "activity": "Double-Sided Drywall Installation with Metal Studs (Up to 10 Feet Height)",
            "recommendedActivities": {
              "13.4.2": {
                "activity": "Drywall Installation (Hung, Taped, Floated, Ready for Paint)"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              }
            }
          },
          "13.4.2": {
            "activity": "Drywall Installation (Hung, Taped, Floated, Ready for Paint)",
            "recommendedActivities": {
              "13.4.1": {
                "activity": "Double-Sided Drywall Installation with Metal Studs (Up to 10 Feet Height)"
              },
              "13.2.3": {
                "activity": "Skim Coat for Drywall"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          }
        }
      },
      "13.5": {
        "category": "Venetian Plaster",
        "activities": {
          "13.5.1": {
            "activity": "Venetian Plaster Application \u2013 Two Coats",
            "recommendedActivities": {
              "13.5.2": {
                "activity": "Venetian Plaster Application \u2013 Three Coats"
              },
              "13.5.3": {
                "activity": "Venetian Plaster Application \u2013 Four Coats"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.5.2": {
            "activity": "Venetian Plaster Application \u2013 Three Coats",
            "recommendedActivities": {
              "13.5.1": {
                "activity": "Venetian Plaster Application \u2013 Two Coats"
              },
              "13.5.3": {
                "activity": "Venetian Plaster Application \u2013 Four Coats"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "13.5.3": {
            "activity": "Venetian Plaster Application \u2013 Four Coats",
            "recommendedActivities": {
              "13.5.1": {
                "activity": "Venetian Plaster Application \u2013 Two Coats"
              },
              "13.5.2": {
                "activity": "Venetian Plaster Application \u2013 Three Coats"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          }
        }
      },
      "13.6": {
        "category": "Ceiling drywall",
        "activities": {
          "13.6.1": {
            "activity": "Curved Ceiling Installation",
            "recommendedActivities": {
              "13.6.2": {
                "activity": "Drywall Ceiling Installation (Ready to Paint)"
              },
              "13.7.1": {
                "activity": "Smooth Drywall Finishing"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.6.2": {
            "activity": "Drywall Ceiling Installation (Ready to Paint)",
            "recommendedActivities": {
              "13.6.3": {
                "activity": "Water-resistant Drywall Ceiling Installation"
              },
              "13.7.3": {
                "activity": "Skim Coat Drywall Finishing"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.6.3": {
            "activity": "Water-resistant Drywall Ceiling Installation",
            "recommendedActivities": {
              "13.6.4": {
                "activity": "Drywall Bulkhead Installation"
              },
              "13.7.2": {
                "activity": "Orange Peel Texture Finishing"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.6.4": {
            "activity": "Drywall Bulkhead Installation",
            "recommendedActivities": {
              "13.6.2": {
                "activity": "Drywall Ceiling Installation (Ready to Paint)"
              },
              "13.7.4": {
                "activity": "Level 5 Drywall Finishing"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "13.7": {
        "category": "Drywall Finishing",
        "activities": {
          "13.7.1": {
            "activity": "Smooth Drywall Finishing",
            "recommendedActivities": {
              "13.7.3": {
                "activity": "Skim Coat Drywall Finishing"
              },
              "13.6.2": {
                "activity": "Drywall Ceiling Installation (Ready to Paint)"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.7.2": {
            "activity": "Orange Peel Texture Finishing",
            "recommendedActivities": {
              "13.7.4": {
                "activity": "Level 5 Drywall Finishing"
              },
              "13.6.1": {
                "activity": "Curved Ceiling Installation"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.7.3": {
            "activity": "Skim Coat Drywall Finishing",
            "recommendedActivities": {
              "13.7.1": {
                "activity": "Smooth Drywall Finishing"
              },
              "13.6.3": {
                "activity": "Water-resistant Drywall Ceiling Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.7.4": {
            "activity": "Level 5 Drywall Finishing",
            "recommendedActivities": {
              "13.7.2": {
                "activity": "Orange Peel Texture Finishing"
              },
              "13.6.4": {
                "activity": "Drywall Bulkhead Installation"
              },
              "3.4.1": {
                "activity": "Ceiling Painting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "13.8": {
        "category": "Specialty Drywall",
        "activities": {
          "13.8.1": {
            "activity": "Fire-Rated Drywall Installation",
            "recommendedActivities": {
              "13.8.2": {
                "activity": "Fiberglass-Faced Drywall Installation"
              },
              "13.8.3": {
                "activity": "Impact-Resistant Drywall Installation"
              },
              "13.7.4": {
                "activity": "Level 5 Drywall Finishing"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.8.2": {
            "activity": "Fiberglass-Faced Drywall Installation",
            "recommendedActivities": {
              "13.8.1": {
                "activity": "Fire-Rated Drywall Installation"
              },
              "13.8.3": {
                "activity": "Impact-Resistant Drywall Installation"
              },
              "13.7.3": {
                "activity": "Skim Coat Drywall Finishing"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.8.3": {
            "activity": "Impact-Resistant Drywall Installation",
            "recommendedActivities": {
              "13.8.1": {
                "activity": "Fire-Rated Drywall Installation"
              },
              "13.8.2": {
                "activity": "Fiberglass-Faced Drywall Installation"
              },
              "13.7.2": {
                "activity": "Orange Peel Texture Finishing"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "13.9": {
        "category": "Drywall Demolition",
        "activities": {
          "13.9.1": {
            "activity": "Full Scale Drywall Removal",
            "recommendedActivities": {
              "13.9.2": {
                "activity": "Selective Drywall Demolition"
              },
              "13.9.3": {
                "activity": "Debris Management and Disposal"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.9.2": {
            "activity": "Selective Drywall Demolition",
            "recommendedActivities": {
              "13.9.1": {
                "activity": "Full Scale Drywall Removal"
              },
              "13.9.3": {
                "activity": "Debris Management and Disposal"
              },
              "13.9.4": {
                "activity": "Historical Preservation and Renovation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.9.3": {
            "activity": "Debris Management and Disposal",
            "recommendedActivities": {
              "13.9.1": {
                "activity": "Full Scale Drywall Removal"
              },
              "13.9.2": {
                "activity": "Selective Drywall Demolition"
              },
              "13.9.5": {
                "activity": "Preparation for Reinstallation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.9.4": {
            "activity": "Historical Preservation and Renovation",
            "recommendedActivities": {
              "13.9.1": {
                "activity": "Full Scale Drywall Removal"
              },
              "13.9.5": {
                "activity": "Preparation for Reinstallation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.9.5": {
            "activity": "Preparation for Reinstallation",
            "recommendedActivities": {
              "13.9.1": {
                "activity": "Full Scale Drywall Removal"
              },
              "13.9.3": {
                "activity": "Debris Management and Disposal"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "13.10": {
        "category": "Bricks",
        "activities": {
          "13.10.1": {
            "activity": "Structural Brick Removal",
            "recommendedActivities": {
              "13.10.2": {
                "activity": "Concrete Block Installation"
              },
              "13.10.3": {
                "activity": "Brick Veneer Installation"
              },
              "13.9.3": {
                "activity": "Debris Management and Disposal"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.10.2": {
            "activity": "Concrete Block Installation",
            "recommendedActivities": {
              "13.10.1": {
                "activity": "Structural Brick Removal"
              },
              "13.10.3": {
                "activity": "Brick Veneer Installation"
              },
              "13.10.4": {
                "activity": "Brick Veneer Sandblasting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.10.3": {
            "activity": "Brick Veneer Installation",
            "recommendedActivities": {
              "13.10.2": {
                "activity": "Concrete Block Installation"
              },
              "13.10.4": {
                "activity": "Brick Veneer Sandblasting"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "13.10.4": {
            "activity": "Brick Veneer Sandblasting",
            "recommendedActivities": {
              "13.10.3": {
                "activity": "Brick Veneer Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      }
    }
  },
  "14": {
    "section": "Appliance",
    "categories": {
      "14.1": {
        "category": "Refrigerator",
        "activities": {
          "14.1.1": {
            "activity": "Refrigerator Removal",
            "recommendedActivities": {
              "14.1.2": {
                "activity": "Top or Bottom Freezer Installation"
              },
              "14.1.3": {
                "activity": "Side by Side Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.1.2": {
            "activity": "Top or Bottom Freezer Installation",
            "recommendedActivities": {
              "14.1.1": {
                "activity": "Refrigerator Removal"
              },
              "14.1.4": {
                "activity": "Custom Refrigerator Installation"
              },
              "14.1.5": {
                "activity": "Wine Cooler Installation"
              }
            }
          },
          "14.1.3": {
            "activity": "Side by Side Installation",
            "recommendedActivities": {
              "14.1.4": {
                "activity": "Custom Refrigerator Installation"
              },
              "14.1.5": {
                "activity": "Wine Cooler Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.1.4": {
            "activity": "Custom Refrigerator Installation",
            "recommendedActivities": {
              "14.1.2": {
                "activity": "Top or Bottom Freezer Installation"
              },
              "14.1.3": {
                "activity": "Side by Side Installation"
              },
              "14.1.5": {
                "activity": "Wine Cooler Installation"
              }
            }
          },
          "14.1.5": {
            "activity": "Wine Cooler Installation",
            "recommendedActivities": {
              "14.1.4": {
                "activity": "Custom Refrigerator Installation"
              },
              "14.1.3": {
                "activity": "Side by Side Installation"
              }
            }
          },
          "14.1.6": {
            "activity": "Refrigerator Not Cooling",
            "recommendedActivities": {
              "14.1.17": {
                "activity": "Refrigerant Leak"
              },
              "14.1.16": {
                "activity": "Compressor Issues"
              }
            }
          },
          "14.1.7": {
            "activity": "Refrigerator Overcooling",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.18": {
                "activity": "Control Board Defect"
              }
            }
          },
          "14.1.8": {
            "activity": "Water Leakage Inside or Outside",
            "recommendedActivities": {
              "14.1.10": {
                "activity": "Ice Maker Not Working"
              },
              "14.1.12": {
                "activity": "Malfunctioning Water Dispenser"
              }
            }
          },
          "14.1.9": {
            "activity": "Buildup of Frost in the Freezer",
            "recommendedActivities": {
              "14.1.17": {
                "activity": "Refrigerant Leak"
              },
              "14.1.16": {
                "activity": "Compressor Issues"
              }
            }
          },
          "14.1.10": {
            "activity": "Ice Maker Not Working",
            "recommendedActivities": {
              "14.1.8": {
                "activity": "Water Leakage Inside or Outside"
              },
              "14.1.12": {
                "activity": "Malfunctioning Water Dispenser"
              }
            }
          },
          "14.1.11": {
            "activity": "Fridge Making Strange Noises",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.19": {
                "activity": "Non-Operating Fans"
              }
            }
          },
          "14.1.12": {
            "activity": "Malfunctioning Water Dispenser",
            "recommendedActivities": {
              "14.1.8": {
                "activity": "Water Leakage Inside or Outside"
              },
              "14.1.10": {
                "activity": "Ice Maker Not Working"
              }
            }
          },
          "14.1.13": {
            "activity": "Refrigerator Light Not Working",
            "recommendedActivities": {
              "14.1.18": {
                "activity": "Control Board Defect"
              },
              "14.1.19": {
                "activity": "Non-Operating Fans"
              }
            }
          },
          "14.1.14": {
            "activity": "Refrigerator Door Not Sealing Properly",
            "recommendedActivities": {
              "14.1.15": {
                "activity": "Temperature Inconsistencies in Fridge or Freezer Section"
              },
              "14.1.13": {
                "activity": "Refrigerator Light Not Working"
              }
            }
          },
          "14.1.15": {
            "activity": "Temperature Inconsistencies in Fridge or Freezer Section",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.17": {
                "activity": "Refrigerant Leak"
              }
            }
          },
          "14.1.16": {
            "activity": "Compressor Issues",
            "recommendedActivities": {
              "14.1.17": {
                "activity": "Refrigerant Leak"
              },
              "14.1.15": {
                "activity": "Temperature Inconsistencies in Fridge or Freezer Section"
              }
            }
          },
          "14.1.17": {
            "activity": "Refrigerant Leak",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.6": {
                "activity": "Refrigerator Not Cooling"
              }
            }
          },
          "14.1.18": {
            "activity": "Control Board Defect",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.13": {
                "activity": "Refrigerator Light Not Working"
              }
            }
          },
          "14.1.19": {
            "activity": "Non-Operating Fans",
            "recommendedActivities": {
              "14.1.16": {
                "activity": "Compressor Issues"
              },
              "14.1.11": {
                "activity": "Fridge Making Strange Noises"
              }
            }
          }
        }
      },
      "14.2": {
        "category": "Oven",
        "activities": {
          "14.2.1": {
            "activity": "Oven Removal",
            "recommendedActivities": {
              "14.2.2": {
                "activity": "Freestanding Gas Range Installation"
              },
              "14.2.3": {
                "activity": "Freestanding Electric Range Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.2.2": {
            "activity": "Freestanding Gas Range Installation",
            "recommendedActivities": {
              "14.2.1": {
                "activity": "Oven Removal"
              },
              "14.2.4": {
                "activity": "Gas Cooktop Installation"
              },
              "14.2.10": {
                "activity": "Oven Calibration and Maintenance"
              }
            }
          },
          "14.2.3": {
            "activity": "Freestanding Electric Range Installation",
            "recommendedActivities": {
              "14.2.1": {
                "activity": "Oven Removal"
              },
              "14.2.5": {
                "activity": "Electric Cooktop Installation"
              },
              "14.2.10": {
                "activity": "Oven Calibration and Maintenance"
              }
            }
          },
          "14.2.4": {
            "activity": "Gas Cooktop Installation",
            "recommendedActivities": {
              "14.2.2": {
                "activity": "Freestanding Gas Range Installation"
              },
              "14.2.9": {
                "activity": "Oven Gas Repair"
              }
            }
          },
          "14.2.5": {
            "activity": "Electric Cooktop Installation",
            "recommendedActivities": {
              "14.2.3": {
                "activity": "Freestanding Electric Range Installation"
              },
              "14.2.7": {
                "activity": "Oven Electrical Repair"
              }
            }
          },
          "14.2.6": {
            "activity": "Wall Oven Installation",
            "recommendedActivities": {
              "14.2.7": {
                "activity": "Oven Electrical Repair"
              },
              "14.2.10": {
                "activity": "Oven Calibration and Maintenance"
              }
            }
          },
          "14.2.7": {
            "activity": "Oven Electrical Repair",
            "recommendedActivities": {
              "14.2.5": {
                "activity": "Electric Cooktop Installation"
              },
              "14.2.6": {
                "activity": "Wall Oven Installation"
              }
            }
          },
          "14.2.8": {
            "activity": "Oven Mechanical Repair",
            "recommendedActivities": {
              "14.2.10": {
                "activity": "Oven Calibration and Maintenance"
              },
              "14.2.9": {
                "activity": "Oven Gas Repair"
              }
            }
          },
          "14.2.9": {
            "activity": "Oven Gas Repair",
            "recommendedActivities": {
              "14.2.2": {
                "activity": "Freestanding Gas Range Installation"
              },
              "14.2.4": {
                "activity": "Gas Cooktop Installation"
              }
            }
          },
          "14.2.10": {
            "activity": "Oven Calibration and Maintenance",
            "recommendedActivities": {
              "14.2.8": {
                "activity": "Oven Mechanical Repair"
              },
              "14.2.6": {
                "activity": "Wall Oven Installation"
              }
            }
          }
        }
      },
      "14.3": {
        "category": "Dishwasher",
        "activities": {
          "14.3.1": {
            "activity": "Dishwasher Removal",
            "recommendedActivities": {
              "14.3.2": {
                "activity": "Dishwasher Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.3.2": {
            "activity": "Dishwasher Installation",
            "recommendedActivities": {
              "14.3.1": {
                "activity": "Dishwasher Removal"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              },
              "14.3.4": {
                "activity": "Dishwasher Electrical and Control Repair"
              }
            }
          },
          "14.3.3": {
            "activity": "Dishwasher Water Flow and Drainage Repair",
            "recommendedActivities": {
              "14.3.2": {
                "activity": "Dishwasher Installation"
              },
              "14.3.5": {
                "activity": "Dishwasher Heating and Drying Repair"
              }
            }
          },
          "14.3.4": {
            "activity": "Dishwasher Electrical and Control Repair",
            "recommendedActivities": {
              "14.3.2": {
                "activity": "Dishwasher Installation"
              },
              "14.3.6": {
                "activity": "Dishwasher Mechanical and Interior Repair"
              }
            }
          },
          "14.3.5": {
            "activity": "Dishwasher Heating and Drying Repair",
            "recommendedActivities": {
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              },
              "14.3.6": {
                "activity": "Dishwasher Mechanical and Interior Repair"
              }
            }
          },
          "14.3.6": {
            "activity": "Dishwasher Mechanical and Interior Repair",
            "recommendedActivities": {
              "14.3.4": {
                "activity": "Dishwasher Electrical and Control Repair"
              },
              "14.3.5": {
                "activity": "Dishwasher Heating and Drying Repair"
              }
            }
          }
        }
      },
      "14.4": {
        "category": "Washer",
        "activities": {
          "14.4.1": {
            "activity": "Washer Removal",
            "recommendedActivities": {
              "14.4.2": {
                "activity": "Smart Washer Installation"
              },
              "14.4.3": {
                "activity": "Laundry Center Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.4.2": {
            "activity": "Smart Washer Installation",
            "recommendedActivities": {
              "14.4.1": {
                "activity": "Washer Removal"
              },
              "14.4.4": {
                "activity": "Washer Water-Related Repair"
              },
              "14.4.6": {
                "activity": "Washer Electrical and Control Repair"
              }
            }
          },
          "14.4.3": {
            "activity": "Laundry Center Installation",
            "recommendedActivities": {
              "14.4.1": {
                "activity": "Washer Removal"
              },
              "14.4.5": {
                "activity": "Washer Mechanical Repair"
              },
              "14.4.7": {
                "activity": "Washer Vibration and Noise Repair"
              }
            }
          },
          "14.4.4": {
            "activity": "Washer Water-Related Repair",
            "recommendedActivities": {
              "14.4.2": {
                "activity": "Smart Washer Installation"
              },
              "14.4.5": {
                "activity": "Washer Mechanical Repair"
              }
            }
          },
          "14.4.5": {
            "activity": "Washer Mechanical Repair",
            "recommendedActivities": {
              "14.4.3": {
                "activity": "Laundry Center Installation"
              },
              "14.4.4": {
                "activity": "Washer Water-Related Repair"
              }
            }
          },
          "14.4.6": {
            "activity": "Washer Electrical and Control Repair",
            "recommendedActivities": {
              "14.4.2": {
                "activity": "Smart Washer Installation"
              },
              "14.4.7": {
                "activity": "Washer Vibration and Noise Repair"
              }
            }
          },
          "14.4.7": {
            "activity": "Washer Vibration and Noise Repair",
            "recommendedActivities": {
              "14.4.3": {
                "activity": "Laundry Center Installation"
              },
              "14.4.6": {
                "activity": "Washer Electrical and Control Repair"
              }
            }
          }
        }
      },
      "14.5": {
        "category": "Dryer",
        "activities": {
          "14.5.1": {
            "activity": "Dryer Removal",
            "recommendedActivities": {
              "14.5.2": {
                "activity": "Electric Dryer Installation"
              },
              "14.5.3": {
                "activity": "Gas Dryer Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "14.5.2": {
            "activity": "Electric Dryer Installation",
            "recommendedActivities": {
              "14.5.1": {
                "activity": "Dryer Removal"
              },
              "14.5.4": {
                "activity": "Dryer Vent Cleaning"
              },
              "14.5.7": {
                "activity": "Dryer Electrical Repair"
              }
            }
          },
          "14.5.3": {
            "activity": "Gas Dryer Installation",
            "recommendedActivities": {
              "14.5.1": {
                "activity": "Dryer Removal"
              },
              "14.5.5": {
                "activity": "Dryer Thermal and Airflow Repair"
              },
              "14.5.8": {
                "activity": "Dryer Noise and Vibration Repair"
              }
            }
          },
          "14.5.4": {
            "activity": "Dryer Vent Cleaning",
            "recommendedActivities": {
              "14.5.2": {
                "activity": "Electric Dryer Installation"
              },
              "14.5.6": {
                "activity": "Dryer Mechanical Repair"
              }
            }
          },
          "14.5.5": {
            "activity": "Dryer Thermal and Airflow Repair",
            "recommendedActivities": {
              "14.5.3": {
                "activity": "Gas Dryer Installation"
              },
              "14.5.4": {
                "activity": "Dryer Vent Cleaning"
              }
            }
          },
          "14.5.6": {
            "activity": "Dryer Mechanical Repair",
            "recommendedActivities": {
              "14.5.4": {
                "activity": "Dryer Vent Cleaning"
              },
              "14.5.7": {
                "activity": "Dryer Electrical Repair"
              }
            }
          },
          "14.5.7": {
            "activity": "Dryer Electrical Repair",
            "recommendedActivities": {
              "14.5.2": {
                "activity": "Electric Dryer Installation"
              },
              "14.5.6": {
                "activity": "Dryer Mechanical Repair"
              }
            }
          },
          "14.5.8": {
            "activity": "Dryer Noise and Vibration Repair",
            "recommendedActivities": {
              "14.5.3": {
                "activity": "Gas Dryer Installation"
              },
              "14.5.7": {
                "activity": "Dryer Electrical Repair"
              }
            }
          }
        }
      },
      "14.6": {
        "category": "Microwave",
        "activities": {
          "14.6.1": {
            "activity": "Microwave Removal",
            "recommendedActivities": {
              "14.6.2": {
                "activity": "Built-In Microwave Installation"
              },
              "14.6.3": {
                "activity": "Over-the-Range Microwave Installation"
              }
            }
          },
          "14.6.2": {
            "activity": "Built-In Microwave Installation",
            "recommendedActivities": {
              "14.6.1": {
                "activity": "Microwave Removal"
              },
              "14.6.4": {
                "activity": "Microwave Electrical and Electronic Repair"
              }
            }
          },
          "14.6.3": {
            "activity": "Over-the-Range Microwave Installation",
            "recommendedActivities": {
              "14.6.1": {
                "activity": "Microwave Removal"
              },
              "14.6.5": {
                "activity": "Microwave Mechanical Repair"
              }
            }
          },
          "14.6.4": {
            "activity": "Microwave Electrical and Electronic Repair",
            "recommendedActivities": {
              "14.6.2": {
                "activity": "Built-In Microwave Installation"
              },
              "14.6.5": {
                "activity": "Microwave Mechanical Repair"
              }
            }
          },
          "14.6.5": {
            "activity": "Microwave Mechanical Repair",
            "recommendedActivities": {
              "14.6.3": {
                "activity": "Over-the-Range Microwave Installation"
              },
              "14.6.4": {
                "activity": "Microwave Electrical and Electronic Repair"
              }
            }
          }
        }
      },
      "14.7": {
        "category": "Range Hood",
        "activities": {
          "14.7.1": {
            "activity": "Range Hood Removal",
            "recommendedActivities": {
              "14.7.2": {
                "activity": "Wall Mount Range Hood Installation"
              },
              "14.7.3": {
                "activity": "Under Cabinet Range Hood Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "14.7.2": {
            "activity": "Wall Mount Range Hood Installation",
            "recommendedActivities": {
              "14.7.1": {
                "activity": "Range Hood Removal"
              },
              "14.7.4": {
                "activity": "Range Hood Cleaning and Maintenance"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "14.7.3": {
            "activity": "Under Cabinet Range Hood Installation",
            "recommendedActivities": {
              "14.7.1": {
                "activity": "Range Hood Removal"
              },
              "14.7.4": {
                "activity": "Range Hood Cleaning and Maintenance"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "14.7.4": {
            "activity": "Range Hood Cleaning and Maintenance",
            "recommendedActivities": {
              "14.1.5": {
                "activity": "Wine Cooler Installation"
              },
              "14.6.4": {
                "activity": "Microwave Electrical and Electronic Repair"
              },
              "14.3.4": {
                "activity": "Dishwasher Electrical and Control Repair"
              },
              "14.5.4": {
                "activity": "Dryer Vent Cleaning"
              }
            }
          }
        }
      },
      "14.8": {
        "category": "Diagnostic",
        "activities": {
          "14.8.1": {
            "activity": "Appliance Electrical Tests",
            "recommendedActivities": {
              "14.8.2": {
                "activity": "Appliance Mechanical Tests"
              },
              "14.8.9": {
                "activity": "Appliance Connectivity Diagnostic"
              },
              "14.7.4": {
                "activity": "Range Hood Cleaning and Maintenance"
              }
            }
          },
          "14.8.2": {
            "activity": "Appliance Mechanical Tests",
            "recommendedActivities": {
              "14.8.1": {
                "activity": "Appliance Electrical Tests"
              },
              "14.8.7": {
                "activity": "Appliance Thermal Diagnostic"
              },
              "14.5.6": {
                "activity": "Dryer Mechanical Repair"
              }
            }
          },
          "14.8.3": {
            "activity": "Appliance Error Code Analysis",
            "recommendedActivities": {
              "14.8.4": {
                "activity": "Performance Tests"
              },
              "14.8.6": {
                "activity": "Appliance Water System Diagnostic"
              }
            }
          },
          "14.8.4": {
            "activity": "Performance Tests",
            "recommendedActivities": {
              "14.8.3": {
                "activity": "Appliance Error Code Analysis"
              },
              "14.8.5": {
                "activity": "Appliance Gas System Diagnostic"
              },
              "14.8.10": {
                "activity": "Appliance Energy Efficiency Diagnostic"
              }
            }
          },
          "14.8.5": {
            "activity": "Appliance Gas System Diagnostic",
            "recommendedActivities": {
              "14.8.4": {
                "activity": "Performance Tests"
              },
              "14.8.6": {
                "activity": "Appliance Water System Diagnostic"
              },
              "14.2.9": {
                "activity": "Oven Gas Repair"
              }
            }
          },
          "14.8.6": {
            "activity": "Appliance Water System Diagnostic",
            "recommendedActivities": {
              "14.8.5": {
                "activity": "Appliance Gas System Diagnostic"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              },
              "14.4.4": {
                "activity": "Washer Water-Related Repair"
              }
            }
          },
          "14.8.7": {
            "activity": "Appliance Thermal Diagnostic",
            "recommendedActivities": {
              "14.8.2": {
                "activity": "Appliance Mechanical Tests"
              },
              "14.8.5": {
                "activity": "Appliance Gas System Diagnostic"
              }
            }
          },
          "14.8.8": {
            "activity": "Appliance Noise and Vibration Diagnostic",
            "recommendedActivities": {
              "14.8.1": {
                "activity": "Appliance Electrical Tests"
              },
              "14.4.7": {
                "activity": "Washer Vibration and Noise Repair"
              },
              "14.5.8": {
                "activity": "Dryer Noise and Vibration Repair"
              }
            }
          },
          "14.8.9": {
            "activity": "Appliance Connectivity Diagnostic",
            "recommendedActivities": {
              "14.8.1": {
                "activity": "Appliance Electrical Tests"
              },
              "14.4.2": {
                "activity": "Smart Washer Installation"
              },
              "14.2.10": {
                "activity": "Oven Calibration and Maintenance"
              }
            }
          },
          "14.8.10": {
            "activity": "Appliance Energy Efficiency Diagnostic",
            "recommendedActivities": {
              "14.8.4": {
                "activity": "Performance Tests"
              },
              "14.8.9": {
                "activity": "Appliance Connectivity Diagnostic"
              }
            }
          }
        }
      }
    }
  },
  "15": {
    "section": "Security",
    "categories": {
      "15.1": {
        "category": "Alarm System",
        "activities": {
          "15.1.1": {
            "activity": "Fire Alarm Detector Installation",
            "recommendedActivities": {
              "15.1.2": {
                "activity": "Carbon Monoxide Detector Installation"
              },
              "15.2.1": {
                "activity": "Wired Security Camera System Installation"
              },
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              }
            }
          },
          "15.1.2": {
            "activity": "Carbon Monoxide Detector Installation",
            "recommendedActivities": {
              "15.1.1": {
                "activity": "Fire Alarm Detector Installation"
              },
              "15.2.1": {
                "activity": "Wired Security Camera System Installation"
              },
              "15.2.3": {
                "activity": "Floodlight Wired Camera Installation"
              }
            }
          }
        }
      },
      "15.2": {
        "category": "CCTV",
        "activities": {
          "15.2.1": {
            "activity": "Wired Security Camera System Installation",
            "recommendedActivities": {
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "15.2.3": {
                "activity": "Floodlight Wired Camera Installation"
              },
              "15.1.1": {
                "activity": "Fire Alarm Detector Installation"
              }
            }
          },
          "15.2.2": {
            "activity": "Wireless Indoor/Outdoor Security Camera Installation",
            "recommendedActivities": {
              "15.2.1": {
                "activity": "Wired Security Camera System Installation"
              },
              "15.1.2": {
                "activity": "Carbon Monoxide Detector Installation"
              },
              "15.2.3": {
                "activity": "Floodlight Wired Camera Installation"
              }
            }
          },
          "15.2.3": {
            "activity": "Floodlight Wired Camera Installation",
            "recommendedActivities": {
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "15.1.2": {
                "activity": "Carbon Monoxide Detector Installation"
              },
              "15.1.1": {
                "activity": "Fire Alarm Detector Installation"
              }
            }
          }
        }
      },
      "15.3": {
        "category": "Smart Lock",
        "activities": {
          "15.3.1": {
            "activity": "Smart WiFi Lock Installation",
            "recommendedActivities": {
              "15.3.2": {
                "activity": "Smart Lock Maintenance and Troubleshooting"
              },
              "15.4.1": {
                "activity": "Wireless Video Doorbell Installation"
              },
              "15.4.2": {
                "activity": "Wired Doorbell Installation"
              }
            }
          },
          "15.3.2": {
            "activity": "Smart Lock Maintenance and Troubleshooting",
            "recommendedActivities": {
              "15.3.1": {
                "activity": "Smart WiFi Lock Installation"
              },
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "15.4.1": {
                "activity": "Wireless Video Doorbell Installation"
              }
            }
          }
        }
      },
      "15.4": {
        "category": "Intercom System",
        "activities": {
          "15.4.1": {
            "activity": "Wireless Video Doorbell Installation",
            "recommendedActivities": {
              "15.4.2": {
                "activity": "Wired Doorbell Installation"
              },
              "15.3.1": {
                "activity": "Smart WiFi Lock Installation"
              },
              "15.1.2": {
                "activity": "Carbon Monoxide Detector Installation"
              }
            }
          },
          "15.4.2": {
            "activity": "Wired Doorbell Installation",
            "recommendedActivities": {
              "15.4.1": {
                "activity": "Wireless Video Doorbell Installation"
              },
              "15.3.2": {
                "activity": "Smart Lock Maintenance and Troubleshooting"
              },
              "15.2.3": {
                "activity": "Floodlight Wired Camera Installation"
              }
            }
          }
        }
      },
      "15.5": {
        "category": "Access Control",
        "activities": {
          "15.5.1": {
            "activity": "Wireless Security System Kit Installation",
            "recommendedActivities": {
              "15.5.2": {
                "activity": "Pedestrian Gate Lock Installation"
              },
              "15.7.1": {
                "activity": "Home Security Door/Window Installation"
              },
              "15.6.2": {
                "activity": "Outdoor Motion Sensor Installation"
              }
            }
          },
          "15.5.2": {
            "activity": "Pedestrian Gate Lock Installation",
            "recommendedActivities": {
              "15.5.1": {
                "activity": "Wireless Security System Kit Installation"
              },
              "15.3.1": {
                "activity": "Smart WiFi Lock Installation"
              },
              "15.4.2": {
                "activity": "Wired Doorbell Installation"
              }
            }
          }
        }
      },
      "15.6": {
        "category": "Motion Sensor",
        "activities": {
          "15.6.1": {
            "activity": "Motion Sensor for Light Fixture Installation",
            "recommendedActivities": {
              "15.6.2": {
                "activity": "Outdoor Motion Sensor Installation"
              },
              "15.2.3": {
                "activity": "Floodlight Wired Camera Installation"
              },
              "15.7.2": {
                "activity": "Garage Door Safety Sensors Installation"
              }
            }
          },
          "15.6.2": {
            "activity": "Outdoor Motion Sensor Installation",
            "recommendedActivities": {
              "15.6.1": {
                "activity": "Motion Sensor for Light Fixture Installation"
              },
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "15.7.1": {
                "activity": "Home Security Door/Window Installation"
              }
            }
          }
        }
      },
      "15.7": {
        "category": "Door Sensor",
        "activities": {
          "15.7.1": {
            "activity": "Home Security Door/Window Installation",
            "recommendedActivities": {
              "15.7.2": {
                "activity": "Garage Door Safety Sensors Installation"
              },
              "15.3.2": {
                "activity": "Smart Lock Maintenance and Troubleshooting"
              },
              "15.5.1": {
                "activity": "Wireless Security System Kit Installation"
              }
            }
          },
          "15.7.2": {
            "activity": "Garage Door Safety Sensors Installation",
            "recommendedActivities": {
              "15.7.1": {
                "activity": "Home Security Door/Window Installation"
              },
              "15.6.2": {
                "activity": "Outdoor Motion Sensor Installation"
              },
              "15.2.1": {
                "activity": "Wired Security Camera System Installation"
              }
            }
          }
        }
      },
      "15.8": {
        "category": "Water Detector",
        "activities": {
          "15.8.1": {
            "activity": "Smart Leak Detectors Installation",
            "recommendedActivities": {
              "15.8.2": {
                "activity": "Smart Water Detector and Automatic Water Shutoff Installation"
              },
              "15.6.2": {
                "activity": "Outdoor Motion Sensor Installation"
              },
              "14.8.6": {
                "activity": "Appliance Water System Diagnostic"
              }
            }
          },
          "15.8.2": {
            "activity": "Smart Water Detector and Automatic Water Shutoff Installation",
            "recommendedActivities": {
              "15.8.1": {
                "activity": "Smart Leak Detectors Installation"
              },
              "14.3.3": {
                "activity": "Dishwasher Water Flow and Drainage Repair"
              },
              "14.4.4": {
                "activity": "Washer Water-Related Repair"
              }
            }
          }
        }
      }
    }
  },
  "16": {
    "section": "Audio-Visual",
    "categories": {
      "16.1": {
        "category": "Projector",
        "activities": {
          "16.1.1": {
            "activity": "Built-in Theater Projector Installation",
            "recommendedActivities": {
              "16.2.1": {
                "activity": "Projection Screen Installation"
              },
              "16.3.1": {
                "activity": "Theater Sound System Installation"
              }
            }
          },
          "16.1.2": {
            "activity": "Built-in Theater Projector Repair",
            "recommendedActivities": {
              "16.3.1": {
                "activity": "Theater Sound System Installation"
              },
              "14.8.9": {
                "activity": "Appliance Connectivity Diagnostic"
              }
            }
          }
        }
      },
      "16.2": {
        "category": "Screen",
        "activities": {
          "16.2.1": {
            "activity": "Projection Screen Installation",
            "recommendedActivities": {
              "16.1.1": {
                "activity": "Built-in Theater Projector Installation"
              },
              "16.3.1": {
                "activity": "Theater Sound System Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          }
        }
      },
      "16.3": {
        "category": "Sound System",
        "activities": {
          "16.3.1": {
            "activity": "Theater Sound System Installation",
            "recommendedActivities": {
              "16.1.1": {
                "activity": "Built-in Theater Projector Installation"
              },
              "16.2.1": {
                "activity": "Projection Screen Installation"
              },
              "14.8.10": {
                "activity": "Appliance Energy Efficiency Diagnostic"
              }
            }
          }
        }
      },
      "16.4": {
        "category": "Speaker",
        "activities": {
          "16.4.1": {
            "activity": "In-wall / In-ceiling Speaker Installation",
            "recommendedActivities": {
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              },
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              }
            }
          },
          "16.4.2": {
            "activity": "Public Address Speaker Installation",
            "recommendedActivities": {
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "16.7.2": {
                "activity": "TV Panel Installation (Up to 90\u201d)"
              },
              "16.8.1": {
                "activity": "Wireless Router Installation"
              }
            }
          }
        }
      },
      "16.5": {
        "category": "AV Receiver",
        "activities": {
          "16.5.1": {
            "activity": "Home Stereo Receiver Installation",
            "recommendedActivities": {
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              },
              "16.8.1": {
                "activity": "Wireless Router Installation"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              }
            }
          }
        }
      },
      "16.6": {
        "category": "Cable and Wire",
        "activities": {
          "16.6.1": {
            "activity": "Rough-in for Audio/Visual (Per Room)",
            "recommendedActivities": {
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              },
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              },
              "16.7.2": {
                "activity": "TV Panel Installation (Up to 90\u201d)"
              }
            }
          }
        }
      },
      "16.7": {
        "category": "TV Wall",
        "activities": {
          "16.7.1": {
            "activity": "TV Panel Installation (Up to 64\u201d)",
            "recommendedActivities": {
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              },
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              },
              "16.8.2": {
                "activity": "Wi-Fi Range Extender Installation"
              }
            }
          },
          "16.7.2": {
            "activity": "TV Panel Installation (Up to 90\u201d)",
            "recommendedActivities": {
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "16.4.2": {
                "activity": "Public Address Speaker Installation"
              },
              "16.8.3": {
                "activity": "Wi-Fi Troubleshooting"
              }
            }
          }
        }
      },
      "16.8": {
        "category": "Wi-Fi",
        "activities": {
          "16.8.1": {
            "activity": "Wireless Router Installation",
            "recommendedActivities": {
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              },
              "16.4.2": {
                "activity": "Public Address Speaker Installation"
              },
              "16.8.2": {
                "activity": "Wi-Fi Range Extender Installation"
              }
            }
          },
          "16.8.2": {
            "activity": "Wi-Fi Range Extender Installation",
            "recommendedActivities": {
              "16.8.1": {
                "activity": "Wireless Router Installation"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              },
              "16.8.3": {
                "activity": "Wi-Fi Troubleshooting"
              }
            }
          },
          "16.8.3": {
            "activity": "Wi-Fi Troubleshooting",
            "recommendedActivities": {
              "16.8.1": {
                "activity": "Wireless Router Installation"
              },
              "16.7.2": {
                "activity": "TV Panel Installation (Up to 90\u201d)"
              },
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              }
            }
          }
        }
      },
      "16.9": {
        "category": "Sound Absorbing",
        "activities": {
          "16.9.1": {
            "activity": "Studiofoam Wedges Installation",
            "recommendedActivities": {
              "16.9.2": {
                "activity": "Paintable Sound Absorbing Acoustic Panels Installation"
              },
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              }
            }
          },
          "16.9.2": {
            "activity": "Paintable Sound Absorbing Acoustic Panels Installation",
            "recommendedActivities": {
              "16.9.1": {
                "activity": "Studiofoam Wedges Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "16.10.1": {
                "activity": "Home Theater Troubleshooting"
              }
            }
          }
        }
      },
      "16.10": {
        "category": "Troubleshooting",
        "activities": {
          "16.10.1": {
            "activity": "Home Theater Troubleshooting",
            "recommendedActivities": {
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              },
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              }
            }
          }
        }
      }
    }
  },
  "17": {
    "section": "Furniture",
    "categories": {
      "17.1": {
        "category": "Assembly",
        "activities": {
          "17.1.1": {
            "activity": "Flat-Pack Furniture Assembly (Small and Medium Items)",
            "recommendedActivities": {
              "17.1.7": {
                "activity": "Entertainment Centers and TV Stand Assembly"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              },
              "16.8.1": {
                "activity": "Wireless Router Installation"
              }
            }
          },
          "17.1.2": {
            "activity": "Flat-Pack Furniture Assembly (Large Items)",
            "recommendedActivities": {
              "17.1.9": {
                "activity": "Bedroom Furniture Assembly"
              },
              "17.1.3": {
                "activity": "Office Furniture Assembly"
              },
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              }
            }
          },
          "17.1.3": {
            "activity": "Office Furniture Assembly",
            "recommendedActivities": {
              "17.1.2": {
                "activity": "Flat-Pack Furniture Assembly (Large Items)"
              },
              "17.1.8": {
                "activity": "Exercise Equipment Assembly"
              },
              "16.8.3": {
                "activity": "Wi-Fi Troubleshooting"
              }
            }
          },
          "17.1.4": {
            "activity": "Outdoor Furniture Assembly",
            "recommendedActivities": {
              "17.1.6": {
                "activity": "Children's Playsets Assembly"
              },
              "16.8.2": {
                "activity": "Wi-Fi Range Extender Installation"
              },
              "15.7.2": {
                "activity": "Garage Door Safety Sensors Installation"
              }
            }
          },
          "17.1.5": {
            "activity": "Children's Simple Furniture Assembly",
            "recommendedActivities": {
              "17.1.6": {
                "activity": "Children's Playsets Assembly"
              },
              "15.7.1": {
                "activity": "Home Security Door/Window Installation"
              },
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              }
            }
          },
          "17.1.6": {
            "activity": "Children's Playsets Assembly",
            "recommendedActivities": {
              "17.1.5": {
                "activity": "Children's Simple Furniture Assembly"
              },
              "15.2.2": {
                "activity": "Wireless Indoor/Outdoor Security Camera Installation"
              },
              "16.4.2": {
                "activity": "Public Address Speaker Installation"
              }
            }
          },
          "17.1.7": {
            "activity": "Entertainment Centers and TV Stand Assembly",
            "recommendedActivities": {
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              },
              "16.3.1": {
                "activity": "Theater Sound System Installation"
              },
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              }
            }
          },
          "17.1.8": {
            "activity": "Exercise Equipment Assembly",
            "recommendedActivities": {
              "17.1.3": {
                "activity": "Office Furniture Assembly"
              },
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "16.8.2": {
                "activity": "Wi-Fi Range Extender Installation"
              }
            }
          },
          "17.1.9": {
            "activity": "Bedroom Furniture Assembly",
            "recommendedActivities": {
              "17.1.2": {
                "activity": "Flat-Pack Furniture Assembly (Large Items)"
              },
              "16.10.1": {
                "activity": "Home Theater Troubleshooting"
              },
              "15.3.1": {
                "activity": "Smart WiFi Lock Installation"
              }
            }
          }
        }
      },
      "17.2": {
        "category": "Installation",
        "activities": {
          "17.2.1": {
            "activity": "Shelf Mounting",
            "recommendedActivities": {
              "17.2.2": {
                "activity": "Small and Medium Picture Hanging Installation"
              },
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              }
            }
          },
          "17.2.2": {
            "activity": "Small and Medium Picture Hanging Installation",
            "recommendedActivities": {
              "17.2.1": {
                "activity": "Shelf Mounting"
              },
              "17.2.3": {
                "activity": "Large Picture Hanging Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              }
            }
          },
          "17.2.3": {
            "activity": "Large Picture Hanging Installation",
            "recommendedActivities": {
              "17.2.2": {
                "activity": "Small and Medium Picture Hanging Installation"
              },
              "17.2.4": {
                "activity": "Frameless Mirror Hanging Installation"
              },
              "16.8.2": {
                "activity": "Wi-Fi Range Extender Installation"
              }
            }
          },
          "17.2.4": {
            "activity": "Frameless Mirror Hanging Installation",
            "recommendedActivities": {
              "17.2.3": {
                "activity": "Large Picture Hanging Installation"
              },
              "3.4.3": {
                "activity": "Wall Painting (Two Coats)"
              },
              "17.2.5": {
                "activity": "Framed Mirror Hanging"
              }
            }
          },
          "17.2.5": {
            "activity": "Framed Mirror Hanging",
            "recommendedActivities": {
              "17.2.4": {
                "activity": "Frameless Mirror Hanging Installation"
              },
              "16.7.1": {
                "activity": "TV Panel Installation (Up to 64\u201d)"
              },
              "16.4.1": {
                "activity": "In-wall / In-ceiling Speaker Installation"
              }
            }
          }
        }
      },
      "17.3": {
        "category": "Repair",
        "activities": {
          "17.3.1": {
            "activity": "Minor Surface and Structural Repair",
            "recommendedActivities": {
              "17.3.3": {
                "activity": "Structural Repairs"
              },
              "17.3.2": {
                "activity": "Cabinet Mechanism Repairs"
              },
              "17.4.1": {
                "activity": "Wood Furniture Cleaning"
              }
            }
          },
          "17.3.2": {
            "activity": "Cabinet Mechanism Repairs",
            "recommendedActivities": {
              "17.3.1": {
                "activity": "Minor Surface and Structural Repair"
              },
              "17.3.4": {
                "activity": "Hardware Replacement"
              },
              "17.4.2": {
                "activity": "Stainless Steel Furniture Cleaning"
              }
            }
          },
          "17.3.3": {
            "activity": "Structural Repairs",
            "recommendedActivities": {
              "17.3.1": {
                "activity": "Minor Surface and Structural Repair"
              },
              "17.2.1": {
                "activity": "Shelf Mounting"
              },
              "17.4.3": {
                "activity": "Copper and Brass Furniture Cleaning"
              }
            }
          },
          "17.3.4": {
            "activity": "Hardware Replacement",
            "recommendedActivities": {
              "17.3.2": {
                "activity": "Cabinet Mechanism Repairs"
              },
              "17.3.3": {
                "activity": "Structural Repairs"
              },
              "17.4.4": {
                "activity": "Metal and Cast Iron Furniture Cleaning"
              }
            }
          }
        }
      },
      "17.4": {
        "category": "Cleaning",
        "activities": {
          "17.4.1": {
            "activity": "Wood Furniture Cleaning",
            "recommendedActivities": {
              "17.4.2": {
                "activity": "Stainless Steel Furniture Cleaning"
              },
              "17.3.1": {
                "activity": "Minor Surface and Structural Repair"
              },
              "12.2.9": {
                "activity": "5BED/5BATH General Cleaning"
              }
            }
          },
          "17.4.2": {
            "activity": "Stainless Steel Furniture Cleaning",
            "recommendedActivities": {
              "17.4.1": {
                "activity": "Wood Furniture Cleaning"
              },
              "17.3.4": {
                "activity": "Hardware Replacement"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "17.4.3": {
            "activity": "Copper and Brass Furniture Cleaning",
            "recommendedActivities": {
              "17.4.4": {
                "activity": "Metal and Cast Iron Furniture Cleaning"
              },
              "17.3.3": {
                "activity": "Structural Repairs"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              }
            }
          },
          "17.4.4": {
            "activity": "Metal and Cast Iron Furniture Cleaning",
            "recommendedActivities": {
              "17.4.3": {
                "activity": "Copper and Brass Furniture Cleaning"
              },
              "17.3.4": {
                "activity": "Hardware Replacement"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "17.5": {
        "category": "Storage",
        "activities": {
          "17.5.1": {
            "activity": "Garage Storage Installation",
            "recommendedActivities": {
              "17.5.4": {
                "activity": "Shelving Installation"
              },
              "15.7.2": {
                "activity": "Garage Door Safety Sensors Installation"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "17.5.2": {
            "activity": "Closet Organizer Installation",
            "recommendedActivities": {
              "17.5.3": {
                "activity": "Wire Closet Organizer Installation"
              },
              "17.2.1": {
                "activity": "Shelf Mounting"
              },
              "12.1.5": {
                "activity": "3BED/3BATH Regular Cleaning"
              }
            }
          },
          "17.5.3": {
            "activity": "Wire Closet Organizer Installation",
            "recommendedActivities": {
              "17.5.2": {
                "activity": "Closet Organizer Installation"
              },
              "17.5.4": {
                "activity": "Shelving Installation"
              },
              "12.2.4": {
                "activity": "3BED/2BATH General Cleaning"
              }
            }
          },
          "17.5.4": {
            "activity": "Shelving Installation",
            "recommendedActivities": {
              "17.5.2": {
                "activity": "Closet Organizer Installation"
              },
              "17.5.3": {
                "activity": "Wire Closet Organizer Installation"
              },
              "17.1.1": {
                "activity": "Flat-Pack Furniture Assembly (Small and Medium Items)"
              }
            }
          }
        }
      },
      "17.6": {
        "category": "Upholstery",
        "activities": {
          "17.6.1": {
            "activity": "Leather Upholstery Cleaning",
            "recommendedActivities": {
              "17.6.2": {
                "activity": "Fabric Upholstery Cleaning"
              },
              "17.6.3": {
                "activity": "Upholstery Repair"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              }
            }
          },
          "17.6.2": {
            "activity": "Fabric Upholstery Cleaning",
            "recommendedActivities": {
              "17.6.1": {
                "activity": "Leather Upholstery Cleaning"
              },
              "17.6.3": {
                "activity": "Upholstery Repair"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "17.6.3": {
            "activity": "Upholstery Repair",
            "recommendedActivities": {
              "17.6.1": {
                "activity": "Leather Upholstery Cleaning"
              },
              "17.6.2": {
                "activity": "Fabric Upholstery Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          }
        }
      },
      "17.7": {
        "category": "Removal",
        "activities": {
          "17.7.1": {
            "activity": "Large Furniture Removal",
            "recommendedActivities": {
              "17.7.2": {
                "activity": "Cabinet Removal"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              }
            }
          },
          "17.7.2": {
            "activity": "Cabinet Removal",
            "recommendedActivities": {
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "17.3.3": {
                "activity": "Structural Repairs"
              },
              "12.3.3": {
                "activity": "Carpet Stairs Cleaning"
              }
            }
          },
          "17.7.3": {
            "activity": "Estate Cleanout",
            "recommendedActivities": {
              "12.7.2": {
                "activity": "Fire and Smoke Damage Cleanup"
              },
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "12.2.9": {
                "activity": "5BED/5BATH General Cleaning"
              }
            }
          }
        }
      },
      "17.8": {
        "category": "Commercial",
        "activities": {
          "17.8.1": {
            "activity": "Reception Desk Installation",
            "recommendedActivities": {
              "17.8.2": {
                "activity": "Executive Desk Installation"
              },
              "17.8.4": {
                "activity": "Room Divider Installation"
              },
              "16.8.1": {
                "activity": "Wireless Router Installation"
              }
            }
          },
          "17.8.2": {
            "activity": "Executive Desk Installation",
            "recommendedActivities": {
              "17.8.1": {
                "activity": "Reception Desk Installation"
              },
              "17.8.3": {
                "activity": "Computer Desks Installation"
              },
              "16.5.1": {
                "activity": "Home Stereo Receiver Installation"
              }
            }
          },
          "17.8.3": {
            "activity": "Computer Desks Installation",
            "recommendedActivities": {
              "17.8.2": {
                "activity": "Executive Desk Installation"
              },
              "17.1.3": {
                "activity": "Office Furniture Assembly"
              },
              "16.8.3": {
                "activity": "Wi-Fi Troubleshooting"
              }
            }
          },
          "17.8.4": {
            "activity": "Room Divider Installation",
            "recommendedActivities": {
              "17.8.1": {
                "activity": "Reception Desk Installation"
              },
              "16.6.1": {
                "activity": "Rough-in for Audio/Visual (Per Room)"
              },
              "12.5.1": {
                "activity": "Office Cleaning"
              }
            }
          }
        }
      }
    }
  },
  "21": {
    "section": "Moving",
    "categories": {
      "21.1": {
        "category": "Residential",
        "activities": {
          "21.1.1": {
            "activity": "Entire Apartment Move",
            "recommendedActivities": {
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              },
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "17.5.1": {
                "activity": "Garage Storage Installation"
              }
            }
          },
          "21.1.2": {
            "activity": "Kitchen Move",
            "recommendedActivities": {
              "17.7.2": {
                "activity": "Cabinet Removal"
              },
              "12.4.3": {
                "activity": "Window Screen Cleaning"
              },
              "12.6.3": {
                "activity": "Post-Move Cleaning"
              }
            }
          },
          "21.1.3": {
            "activity": "Living Room Move",
            "recommendedActivities": {
              "17.1.7": {
                "activity": "Entertainment Centers and TV Stand Assembly"
              },
              "17.2.2": {
                "activity": "Small and Medium Picture Hanging Installation"
              },
              "12.4.1": {
                "activity": "Window Cleaning (per side) 41 - 60 SF"
              }
            }
          },
          "21.1.4": {
            "activity": "Master Bedroom Move",
            "recommendedActivities": {
              "17.6.2": {
                "activity": "Fabric Upholstery Cleaning"
              },
              "17.3.1": {
                "activity": "Minor Surface and Structural Repair"
              },
              "12.6.3": {
                "activity": "Post-Move Cleaning"
              }
            }
          },
          "21.1.5": {
            "activity": "Bathroom Move",
            "recommendedActivities": {
              "17.3.4": {
                "activity": "Hardware Replacement"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              },
              "12.6.3": {
                "activity": "Post-Move Cleaning"
              }
            }
          },
          "21.1.6": {
            "activity": "Garage Move",
            "recommendedActivities": {
              "17.5.1": {
                "activity": "Garage Storage Installation"
              },
              "17.7.3": {
                "activity": "Estate Cleanout"
              },
              "15.7.2": {
                "activity": "Garage Door Safety Sensors Installation"
              }
            }
          }
        }
      },
      "21.2": {
        "category": "Commercial",
        "activities": {
          "21.2.1": {
            "activity": "Office Move",
            "recommendedActivities": {
              "21.3.7": {
                "activity": "Office Packing and Unpacking"
              },
              "17.8.4": {
                "activity": "Room Divider Installation"
              },
              "12.5.1": {
                "activity": "Office Cleaning"
              }
            }
          },
          "21.2.2": {
            "activity": "Clothing Store Move",
            "recommendedActivities": {
              "21.3.8": {
                "activity": "Store Packing and Unpacking"
              },
              "17.8.1": {
                "activity": "Reception Desk Installation"
              },
              "12.5.2": {
                "activity": "Retail Store Cleaning"
              }
            }
          },
          "21.2.3": {
            "activity": "Coffee Shop/Restaurant Move",
            "recommendedActivities": {
              "21.3.9": {
                "activity": "Coffee Shop/Restaurant Packing and Unpacking"
              },
              "17.7.3": {
                "activity": "Estate Cleanout"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "21.3": {
        "category": "Packing/Unpacking",
        "activities": {
          "21.3.1": {
            "activity": "Entire Apartment Packing and Unpacking",
            "recommendedActivities": {
              "21.1.1": {
                "activity": "Entire Apartment Move"
              },
              "12.6.3": {
                "activity": "Post-Move Cleaning"
              },
              "17.1.1": {
                "activity": "Flat-Pack Furniture Assembly (Small and Medium Items)"
              }
            }
          },
          "21.3.2": {
            "activity": "Kitchen Packing and Unpacking",
            "recommendedActivities": {
              "21.1.2": {
                "activity": "Kitchen Move"
              },
              "17.7.2": {
                "activity": "Cabinet Removal"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "21.3.3": {
            "activity": "Living Room Packing and Unpacking",
            "recommendedActivities": {
              "21.1.3": {
                "activity": "Living Room Move"
              },
              "17.1.7": {
                "activity": "Entertainment Centers and TV Stand Assembly"
              },
              "12.4.1": {
                "activity": "Window Cleaning (per side) 41 - 60 SF"
              }
            }
          },
          "21.3.4": {
            "activity": "Bedroom Packing and Unpacking",
            "recommendedActivities": {
              "21.1.4": {
                "activity": "Master Bedroom Move"
              },
              "17.6.2": {
                "activity": "Fabric Upholstery Cleaning"
              },
              "12.3.2": {
                "activity": "Heavy Stain Carpet Cleaning and Deodorizing"
              }
            }
          },
          "21.3.5": {
            "activity": "Bathroom Packing and Unpacking",
            "recommendedActivities": {
              "21.1.5": {
                "activity": "Bathroom Move"
              },
              "17.3.4": {
                "activity": "Hardware Replacement"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "21.3.6": {
            "activity": "Garage Packing and Unpacking",
            "recommendedActivities": {
              "21.1.6": {
                "activity": "Garage Move"
              },
              "17.5.1": {
                "activity": "Garage Storage Installation"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              }
            }
          },
          "21.3.7": {
            "activity": "Office Packing and Unpacking",
            "recommendedActivities": {
              "21.2.1": {
                "activity": "Office Move"
              },
              "17.8.3": {
                "activity": "Computer Desks Installation"
              },
              "12.5.1": {
                "activity": "Office Cleaning"
              }
            }
          },
          "21.3.8": {
            "activity": "Store Packing and Unpacking",
            "recommendedActivities": {
              "21.2.2": {
                "activity": "Clothing Store Move"
              },
              "17.8.1": {
                "activity": "Reception Desk Installation"
              },
              "12.5.2": {
                "activity": "Retail Store Cleaning"
              }
            }
          },
          "21.3.9": {
            "activity": "Coffee Shop/Restaurant Packing and Unpacking",
            "recommendedActivities": {
              "21.2.3": {
                "activity": "Coffee Shop/Restaurant Move"
              },
              "17.7.3": {
                "activity": "Estate Cleanout"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      },
      "21.4": {
        "category": "Specialty Moving",
        "activities": {
          "21.4.1": {
            "activity": "Piano Move",
            "recommendedActivities": {
              "21.6.2": {
                "activity": "Post-Move Cleaning"
              },
              "21.5.1": {
                "activity": "Miscellaneous Indoor Storage"
              },
              "17.3.1": {
                "activity": "Minor Surface and Structural Repair"
              }
            }
          },
          "21.4.2": {
            "activity": "Art and Antiques Move",
            "recommendedActivities": {
              "21.5.1": {
                "activity": "Miscellaneous Indoor Storage"
              },
              "21.6.2": {
                "activity": "Post-Move Cleaning"
              },
              "12.3.5": {
                "activity": "Natural Marble - Heavy Cleaning"
              }
            }
          },
          "21.4.3": {
            "activity": "Chandelier Move",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.2.3": {
                "activity": "Large Picture Hanging Installation"
              },
              "16.10.1": {
                "activity": "Home Theater Troubleshooting"
              }
            }
          },
          "21.4.4": {
            "activity": "Vehicle Transport Move",
            "recommendedActivities": {
              "21.5.5": {
                "activity": "Office or Warehouse Indoor Storage"
              },
              "17.7.3": {
                "activity": "Estate Cleanout"
              },
              "12.7.1": {
                "activity": "Flood Damage Cleanup"
              }
            }
          }
        }
      },
      "21.5": {
        "category": "Storage Solutions",
        "activities": {
          "21.5.1": {
            "activity": "Miscellaneous Indoor Storage",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          },
          "21.5.2": {
            "activity": "1-2 Bedroom Home Indoor Storage",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.5.2": {
                "activity": "Closet Organizer Installation"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "21.5.3": {
            "activity": "2-3 Bedroom Home Indoor Storage",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.1.9": {
                "activity": "Bedroom Furniture Assembly"
              },
              "12.6.2": {
                "activity": "Post-Move Cleaning"
              }
            }
          },
          "21.5.4": {
            "activity": "4 Bedroom Home or Larger Indoor Storage",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "12.7.2": {
                "activity": "Fire and Smoke Damage Cleanup"
              }
            }
          },
          "21.5.5": {
            "activity": "Office or Warehouse Indoor Storage",
            "recommendedActivities": {
              "21.6.1": {
                "activity": "Pre-Move Cleaning"
              },
              "17.8.1": {
                "activity": "Reception Desk Installation"
              },
              "12.5.1": {
                "activity": "Office Cleaning"
              }
            }
          }
        }
      },
      "21.6": {
        "category": "Cleaning Services",
        "activities": {
          "21.6.1": {
            "activity": "Pre-Move Cleaning",
            "recommendedActivities": {
              "21.5.1": {
                "activity": "Miscellaneous Indoor Storage"
              },
              "17.7.1": {
                "activity": "Large Furniture Removal"
              },
              "12.3.4": {
                "activity": "Tile - Heavy Cleaning"
              }
            }
          },
          "21.6.2": {
            "activity": "Post-Move Cleaning",
            "recommendedActivities": {
              "21.5.2": {
                "activity": "1-2 Bedroom Home Indoor Storage"
              },
              "17.1.1": {
                "activity": "Flat-Pack Furniture Assembly (Small and Medium Items)"
              },
              "12.6.3": {
                "activity": "Final Cleaning after Construction"
              }
            }
          }
        }
      }
    }
  },
  "8": {
    "section": "Outdoor Painting",
    "categories": {
      "8.1": {
        "category": "Exterior Wall",
        "activities": {
          "8.1.1": {
            "activity": "Masonry Painting (Two Coats on a Single-Story Building)",
            "recommendedActivities": {
              "8.1.4": {
                "activity": "Exterior Wood Painting (Two Coats on a Single-Story Building)"
              },
              "8.1.2": {
                "activity": "Exterior Wood Stain Painting (Single-Story Building)"
              },
              "8.4.1": {
                "activity": "Window Trim & Jamb Painting"
              },
              "8.5.1": {
                "activity": "Door Slab Priming and Painting"
              }
            }
          },
          "8.1.2": {
            "activity": "Exterior Wood Stain Painting (Single-Story Building)",
            "recommendedActivities": {
              "8.1.1": {
                "activity": "Masonry Painting (Two Coats on a Single-Story Building)"
              },
              "8.1.4": {
                "activity": "Exterior Wood Painting (Two Coats on a Single-Story Building)"
              },
              "8.3.2": {
                "activity": "Deck Coating (Acrylic Polymer)"
              },
              "8.7.1": {
                "activity": "Trim Painting with One Coat"
              }
            }
          },
          "8.1.3": {
            "activity": "Masonry Painting (One Coat on a Single-Story Building)",
            "recommendedActivities": {
              "8.1.1": {
                "activity": "Masonry Painting (Two Coats on a Single-Story Building)"
              },
              "8.1.2": {
                "activity": "Exterior Wood Stain Painting (Single-Story Building)"
              },
              "8.1.5": {
                "activity": "Wood Shingle Staining (Two Coats on a Single-Story Building)"
              },
              "8.2.1": {
                "activity": "Ornamental Fence Priming and Painting"
              }
            }
          },
          "8.1.4": {
            "activity": "Exterior Wood Painting (Two Coats on a Single-Story Building)",
            "recommendedActivities": {
              "8.1.1": {
                "activity": "Masonry Painting (Two Coats on a Single-Story Building)"
              },
              "8.1.5": {
                "activity": "Wood Shingle Staining (Two Coats on a Single-Story Building)"
              },
              "8.5.3": {
                "activity": "Door Slab Staining and Finishing"
              },
              "8.6.1": {
                "activity": "Window Shutter Finishing"
              }
            }
          },
          "8.1.5": {
            "activity": "Wood Shingle Staining (Two Coats on a Single-Story Building)",
            "recommendedActivities": {
              "8.1.4": {
                "activity": "Exterior Wood Painting (Two Coats on a Single-Story Building)"
              },
              "8.1.6": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.2.3": {
                "activity": "Wood Fence or Gate Sealing and Painting"
              },
              "8.8.1": {
                "activity": "Stucco Acrylic Latex Painting"
              }
            }
          },
          "8.1.6": {
            "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)",
            "recommendedActivities": {
              "8.1.8": {
                "activity": "Masonry Painting (One Coat on a 2-3 Story Building)"
              },
              "8.1.7": {
                "activity": "Exterior Wood Stain Painting (2-3 Story Building)"
              },
              "8.4.2": {
                "activity": "Window Trim and Jamb Staining and Finishing"
              },
              "8.9.2": {
                "activity": "Brick Elastomeric Painting"
              }
            }
          },
          "8.1.7": {
            "activity": "Exterior Wood Stain Painting (2-3 Story Building)",
            "recommendedActivities": {
              "8.1.6": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.1.8": {
                "activity": "Masonry Painting (One Coat on a 2-3 Story Building)"
              },
              "8.4.3": {
                "activity": "Window Trim Painting: One Coat"
              },
              "8.2.4": {
                "activity": "Wood Fence Post Painting and Finishing"
              }
            }
          },
          "8.1.8": {
            "activity": "Masonry Painting (One Coat on a 2-3 Story Building)",
            "recommendedActivities": {
              "8.1.6": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.1.7": {
                "activity": "Exterior Wood Stain Painting (2-3 Story Building)"
              },
              "8.1.9": {
                "activity": "Exterior Wood Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.4.1": {
                "activity": "Window Trim & Jamb Painting"
              }
            }
          },
          "8.1.9": {
            "activity": "Exterior Wood Painting (Two Coats on a 2-3 Story Building)",
            "recommendedActivities": {
              "8.1.8": {
                "activity": "Masonry Painting (One Coat on a 2-3 Story Building)"
              },
              "8.1.6": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.1.10": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.6.2": {
                "activity": "Window Shutter Painting "
              }
            }
          },
          "8.1.10": {
            "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)",
            "recommendedActivities": {
              "8.1.9": {
                "activity": "Exterior Wood Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.1.6": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.3.4": {
                "activity": "Deck Priming and Painting"
              },
              "8.5.5": {
                "activity": "Single Garage Door Opening and Trim Sealing and Painting"
              }
            }
          },
          "8.1.11": {
            "activity": "High-Rise Painting (Up to 60 Feet or Difficult-to-Reach Areas of the Facade)",
            "recommendedActivities": {
              "8.1.9": {
                "activity": "Exterior Wood Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.1.10": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              },
              "8.6.2": {
                "activity": "Window Shutter Painting "
              },
              "8.2.3": {
                "activity": "Wood Fence or Gate Sealing and Painting"
              }
            }
          }
        }
      }
    }
  },
  "9": {
    "section": "Outdoor Carpentry",
    "categories": {
      "9.1": {
        "category": "Deck",
        "activities": {
          "9.1.1": {
            "activity": "Adjustable Helical Post Foundation Installation",
            "recommendedActivities": {
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              },
              "9.1.5": {
                "activity": "Composite Decking Installation"
              },
              "9.2.1": {
                "activity": "Premium Cedar Fence Installation"
              },
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              }
            }
          },
          "9.1.2": {
            "activity": "Plastic Adjustable Pedestal and Framing Installation",
            "recommendedActivities": {
              "9.1.3": {
                "activity": "Concrete Blocks and Lumber Foundation Installation"
              },
              "9.1.5": {
                "activity": "Composite Decking Installation"
              },
              "9.3.1": {
                "activity": "Cedar Pergola Kit Installation"
              },
              "9.4.1": {
                "activity": "Cedar Gazebo Kit Installation"
              }
            }
          },
          "9.1.3": {
            "activity": "Concrete Blocks and Lumber Foundation Installation",
            "recommendedActivities": {
              "9.1.2": {
                "activity": "Plastic Adjustable Pedestal and Framing Installation"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              },
              "9.1.14": {
                "activity": "Deck Sanding, Staining, and Finishing"
              },
              "9.5.1": {
                "activity": "Outdoor Furniture Assembly"
              }
            }
          },
          "9.1.4": {
            "activity": "Pressure-Treated Wood Decking Installation",
            "recommendedActivities": {
              "9.1.1": {
                "activity": "Adjustable Helical Post Foundation Installation"
              },
              "9.1.5": {
                "activity": "Composite Decking Installation"
              },
              "9.3.3": {
                "activity": "Polycarbonate Roof Installation"
              },
              "9.4.3": {
                "activity": "Gazebo Roof Installation"
              }
            }
          },
          "9.1.5": {
            "activity": "Composite Decking Installation",
            "recommendedActivities": {
              "9.1.2": {
                "activity": "Plastic Adjustable Pedestal and Framing Installation"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              },
              "9.1.14": {
                "activity": "Deck Sanding, Staining, and Finishing"
              },
              "9.3.2": {
                "activity": "Concrete Column Pergola Installation"
              }
            }
          }
        }
      },
      "9.2": {
        "category": "Fence",
        "activities": {
          "9.2.1": {
            "activity": "Premium Cedar Fence Installation",
            "recommendedActivities": {
              "9.2.2": {
                "activity": "Western Red Cedar Fence Installation"
              },
              "9.2.4": {
                "activity": "Vinyl Fence Installation"
              },
              "8.2.2": {
                "activity": "Wood Fence or Gate Staining"
              },
              "8.2.3": {
                "activity": "Wood Fence or Gate Sealing and Painting"
              }
            }
          },
          "9.2.2": {
            "activity": "Western Red Cedar Fence Installation",
            "recommendedActivities": {
              "9.2.1": {
                "activity": "Premium Cedar Fence Installation"
              },
              "9.2.3": {
                "activity": "Picket Fence Installation"
              },
              "8.2.4": {
                "activity": "Wood Fence Post Painting and Finishing"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              }
            }
          },
          "9.2.3": {
            "activity": "Picket Fence Installation",
            "recommendedActivities": {
              "9.2.2": {
                "activity": "Western Red Cedar Fence Installation"
              },
              "9.2.4": {
                "activity": "Vinyl Fence Installation"
              },
              "8.2.1": {
                "activity": "Ornamental Fence Priming and Painting"
              },
              "9.2.10": {
                "activity": "Single Automatic Gate Opener Installation"
              }
            }
          },
          "9.2.4": {
            "activity": "Vinyl Fence Installation",
            "recommendedActivities": {
              "9.2.3": {
                "activity": "Picket Fence Installation"
              },
              "9.2.5": {
                "activity": "Chain Link Fence Installation"
              },
              "8.2.3": {
                "activity": "Wood Fence or Gate Sealing and Painting"
              },
              "9.2.6": {
                "activity": "Metal Fence Installation"
              }
            }
          },
          "9.2.5": {
            "activity": "Chain Link Fence Installation",
            "recommendedActivities": {
              "9.2.4": {
                "activity": "Vinyl Fence Installation"
              },
              "9.2.6": {
                "activity": "Metal Fence Installation"
              },
              "8.2.2": {
                "activity": "Wood Fence or Gate Staining"
              },
              "9.2.9": {
                "activity": "Driveway Metal Gate Installation"
              }
            }
          },
          "9.2.6": {
            "activity": "Metal Fence Installation",
            "recommendedActivities": {
              "9.2.5": {
                "activity": "Chain Link Fence Installation"
              },
              "9.2.7": {
                "activity": "Composite Fence Installation"
              },
              "9.2.8": {
                "activity": "Composite Fence on Concrete Installation"
              },
              "9.2.10": {
                "activity": "Single Automatic Gate Opener Installation"
              }
            }
          }
        }
      },
      "9.3": {
        "category": "Pergola",
        "activities": {
          "9.3.1": {
            "activity": "Cedar Pergola Kit Installation",
            "recommendedActivities": {
              "9.3.2": {
                "activity": "Concrete Column Pergola Installation"
              },
              "9.3.3": {
                "activity": "Polycarbonate Roof Installation"
              },
              "9.4.1": {
                "activity": "Cedar Gazebo Kit Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              }
            }
          },
          "9.3.2": {
            "activity": "Concrete Column Pergola Installation",
            "recommendedActivities": {
              "9.3.1": {
                "activity": "Cedar Pergola Kit Installation"
              },
              "9.3.3": {
                "activity": "Polycarbonate Roof Installation"
              },
              "9.4.2": {
                "activity": "Concrete Column Gazebo Installation"
              },
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              }
            }
          },
          "9.3.3": {
            "activity": "Polycarbonate Roof Installation",
            "recommendedActivities": {
              "9.3.2": {
                "activity": "Concrete Column Pergola Installation"
              },
              "9.4.3": {
                "activity": "Gazebo Roof Installation"
              },
              "9.6.6": {
                "activity": "Patio Cover Installation"
              },
              "9.3.1": {
                "activity": "Cedar Pergola Kit Installation"
              }
            }
          },
          "9.3.4": {
            "activity": "Pergola Removal",
            "recommendedActivities": {
              "9.4.4": {
                "activity": "Gazebo Removal"
              },
              "9.6.7": {
                "activity": "Outdoor Storage Removal"
              },
              "9.3.3": {
                "activity": "Polycarbonate Roof Installation"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          }
        }
      },
      "9.4": {
        "category": "Gazebo",
        "activities": {
          "9.4.1": {
            "activity": "Cedar Gazebo Kit Installation",
            "recommendedActivities": {
              "9.4.2": {
                "activity": "Concrete Column Gazebo Installation"
              },
              "9.4.3": {
                "activity": "Gazebo Roof Installation"
              },
              "9.3.1": {
                "activity": "Cedar Pergola Kit Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              }
            }
          },
          "9.4.2": {
            "activity": "Concrete Column Gazebo Installation",
            "recommendedActivities": {
              "9.4.1": {
                "activity": "Cedar Gazebo Kit Installation"
              },
              "9.4.3": {
                "activity": "Gazebo Roof Installation"
              },
              "9.3.2": {
                "activity": "Concrete Column Pergola Installation"
              },
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              }
            }
          },
          "9.4.3": {
            "activity": "Gazebo Roof Installation",
            "recommendedActivities": {
              "9.4.1": {
                "activity": "Cedar Gazebo Kit Installation"
              },
              "9.4.2": {
                "activity": "Concrete Column Gazebo Installation"
              },
              "9.3.3": {
                "activity": "Polycarbonate Roof Installation"
              },
              "9.6.6": {
                "activity": "Patio Cover Installation"
              }
            }
          },
          "9.4.4": {
            "activity": "Gazebo Removal",
            "recommendedActivities": {
              "9.3.4": {
                "activity": "Pergola Removal"
              },
              "9.6.7": {
                "activity": "Outdoor Storage Removal"
              },
              "9.4.3": {
                "activity": "Gazebo Roof Installation"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          }
        }
      },
      "9.5": {
        "category": "Outdoor Furniture",
        "activities": {
          "9.5.1": {
            "activity": "Outdoor Furniture Assembly",
            "recommendedActivities": {
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.6": {
                "activity": "Patio Cover Installation"
              },
              "8.3.4": {
                "activity": "Deck Stairs Installation (Up to 4 Feet)"
              },
              "8.4.1": {
                "activity": "Outdoor Lighting Installation"
              }
            }
          }
        }
      },
      "9.6": {
        "category": "Outdoor Storage",
        "activities": {
          "9.6.1": {
            "activity": "Outdoor Storage Concrete Slab Foundation Installation",
            "recommendedActivities": {
              "9.6.2": {
                "activity": "Outdoor Storage Square Patio Stone Basement Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.4": {
                "activity": "Carport Installation"
              },
              "9.6.5": {
                "activity": "Storage Building Kit Installation"
              }
            }
          },
          "9.6.2": {
            "activity": "Outdoor Storage Square Patio Stone Basement Installation",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.4": {
                "activity": "Carport Installation"
              },
              "9.6.5": {
                "activity": "Storage Building Kit Installation"
              }
            }
          },
          "9.6.3": {
            "activity": "Outdoor Storage Shed Installation",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.6.2": {
                "activity": "Outdoor Storage Square Patio Stone Basement Installation"
              },
              "9.6.4": {
                "activity": "Carport Installation"
              },
              "9.6.5": {
                "activity": "Storage Building Kit Installation"
              }
            }
          },
          "9.6.4": {
            "activity": "Carport Installation",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.6.2": {
                "activity": "Outdoor Storage Square Patio Stone Basement Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.5": {
                "activity": "Storage Building Kit Installation"
              }
            }
          },
          "9.6.5": {
            "activity": "Storage Building Kit Installation",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.6.2": {
                "activity": "Outdoor Storage Square Patio Stone Basement Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.4": {
                "activity": "Carport Installation"
              }
            }
          },
          "9.6.6": {
            "activity": "Patio Cover Installation",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.6.2": {
                "activity": "Outdoor Storage Square Patio Stone Basement Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "9.6.4": {
                "activity": "Carport Installation"
              }
            }
          },
          "9.6.7": {
            "activity": "Outdoor Storage Removal",
            "recommendedActivities": {
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "9.3.4": {
                "activity": "Pergola Removal"
              },
              "9.4.4": {
                "activity": "Gazebo Removal"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          }
        }
      },
      "9.7": {
        "category": "Playground",
        "activities": {
          "9.7.1": {
            "activity": "Swing Sets Installation",
            "recommendedActivities": {
              "9.7.2": {
                "activity": "Playhouse Installation"
              },
              "9.7.3": {
                "activity": "Sandbox Installation"
              },
              "9.6.3": {
                "activity": "Outdoor Storage Shed Installation"
              },
              "8.3.4": {
                "activity": "Deck Stairs Installation (Up to 4 Feet)"
              }
            }
          },
          "9.7.2": {
            "activity": "Playhouse Installation",
            "recommendedActivities": {
              "9.7.1": {
                "activity": "Swing Sets Installation"
              },
              "9.7.3": {
                "activity": "Sandbox Installation"
              },
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              },
              "8.4.1": {
                "activity": "Outdoor Lighting Installation"
              }
            }
          },
          "9.7.3": {
            "activity": "Sandbox Installation",
            "recommendedActivities": {
              "9.7.1": {
                "activity": "Swing Sets Installation"
              },
              "9.7.2": {
                "activity": "Playhouse Installation"
              },
              "9.6.5": {
                "activity": "Storage Building Kit Installation"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          }
        }
      },
      "9.8": {
        "category": "Staircases",
        "activities": {
          "9.8.1": {
            "activity": "4-Step Outdoor Stair Installation",
            "recommendedActivities": {
              "9.8.2": {
                "activity": "5-Step Outdoor Stair Installation"
              },
              "9.8.5": {
                "activity": "6-Foot Staircase Landing Installation"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              },
              "9.8.9": {
                "activity": "Outdoor Staircase Step Replacement"
              }
            }
          },
          "9.8.2": {
            "activity": "5-Step Outdoor Stair Installation",
            "recommendedActivities": {
              "9.8.3": {
                "activity": "6-Step Outdoor Stair Installation"
              },
              "9.8.6": {
                "activity": "8-Foot Staircase Landing Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              },
              "9.8.10": {
                "activity": "Outdoor Staircase Hand Rail Replacement"
              }
            }
          },
          "9.8.3": {
            "activity": "6-Step Outdoor Stair Installation",
            "recommendedActivities": {
              "9.8.4": {
                "activity": "8-Step Outdoor Stair Installation"
              },
              "9.8.5": {
                "activity": "6-Foot Staircase Landing Installation"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              },
              "9.8.9": {
                "activity": "Outdoor Staircase Step Replacement"
              }
            }
          },
          "9.8.4": {
            "activity": "8-Step Outdoor Stair Installation",
            "recommendedActivities": {
              "9.8.6": {
                "activity": "8-Foot Staircase Landing Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              },
              "9.8.10": {
                "activity": "Outdoor Staircase Hand Rail Replacement"
              },
              "9.8.11": {
                "activity": "Outdoor Staircase Removal (Per Rise)"
              }
            }
          },
          "9.8.5": {
            "activity": "6-Foot Staircase Landing Installation",
            "recommendedActivities": {
              "9.8.1": {
                "activity": "4-Step Outdoor Stair Installation"
              },
              "9.8.3": {
                "activity": "6-Step Outdoor Stair Installation"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              },
              "9.8.9": {
                "activity": "Outdoor Staircase Step Replacement"
              }
            }
          },
          "9.8.6": {
            "activity": "8-Foot Staircase Landing Installation",
            "recommendedActivities": {
              "9.8.2": {
                "activity": "5-Step Outdoor Stair Installation"
              },
              "9.8.4": {
                "activity": "8-Step Outdoor Stair Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              },
              "9.8.10": {
                "activity": "Outdoor Staircase Hand Rail Replacement"
              }
            }
          },
          "9.8.7": {
            "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation",
            "recommendedActivities": {
              "9.8.1": {
                "activity": "4-Step Outdoor Stair Installation"
              },
              "9.8.3": {
                "activity": "6-Step Outdoor Stair Installation"
              },
              "9.8.5": {
                "activity": "6-Foot Staircase Landing Installation"
              },
              "9.8.9": {
                "activity": "Outdoor Staircase Step Replacement"
              }
            }
          },
          "9.8.8": {
            "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation",
            "recommendedActivities": {
              "9.8.2": {
                "activity": "5-Step Outdoor Stair Installation"
              },
              "9.8.4": {
                "activity": "8-Step Outdoor Stair Installation"
              },
              "9.8.6": {
                "activity": "8-Foot Staircase Landing Installation"
              },
              "9.8.10": {
                "activity": "Outdoor Staircase Hand Rail Replacement"
              }
            }
          },
          "9.8.9": {
            "activity": "Outdoor Staircase Step Replacement",
            "recommendedActivities": {
              "9.8.1": {
                "activity": "4-Step Outdoor Stair Installation"
              },
              "9.8.5": {
                "activity": "6-Foot Staircase Landing Installation"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              },
              "9.8.11": {
                "activity": "Outdoor Staircase Removal (Per Rise)"
              }
            }
          },
          "9.8.10": {
            "activity": "Outdoor Staircase Hand Rail Replacement",
            "recommendedActivities": {
              "9.8.2": {
                "activity": "5-Step Outdoor Stair Installation"
              },
              "9.8.6": {
                "activity": "8-Foot Staircase Landing Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              },
              "9.8.11": {
                "activity": "Outdoor Staircase Removal (Per Rise)"
              }
            }
          },
          "9.8.11": {
            "activity": "Outdoor Staircase Removal (Per Rise)",
            "recommendedActivities": {
              "9.8.9": {
                "activity": "Outdoor Staircase Step Replacement"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          }
        }
      },
      "9.9": {
        "category": "Walkway",
        "activities": {
          "9.9.1": {
            "activity": "Wooden Walkway Installation",
            "recommendedActivities": {
              "9.9.2": {
                "activity": "Wooden Walkway Sanding and Staining"
              },
              "9.9.3": {
                "activity": "Wooden Walkway Removal"
              },
              "9.10.1": {
                "activity": "Boat Dock Installation"
              },
              "9.8.1": {
                "activity": "4-Step Outdoor Stair Installation"
              }
            }
          },
          "9.9.2": {
            "activity": "Wooden Walkway Sanding and Staining",
            "recommendedActivities": {
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              },
              "9.9.3": {
                "activity": "Wooden Walkway Removal"
              },
              "9.10.2": {
                "activity": "Cedar Dock Decking Installation for Boat Dock Systems"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          },
          "9.9.3": {
            "activity": "Wooden Walkway Removal",
            "recommendedActivities": {
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              },
              "9.9.2": {
                "activity": "Wooden Walkway Sanding and Staining"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              },
              "9.8.11": {
                "activity": "Outdoor Staircase Removal (Per Rise)"
              }
            }
          }
        }
      },
      "9.10": {
        "category": "Dock",
        "activities": {
          "9.10.1": {
            "activity": "Boat Dock Installation",
            "recommendedActivities": {
              "9.10.2": {
                "activity": "Cedar Dock Decking Installation for Boat Dock Systems"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              },
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              }
            }
          },
          "9.10.2": {
            "activity": "Cedar Dock Decking Installation for Boat Dock Systems",
            "recommendedActivities": {
              "9.10.1": {
                "activity": "Boat Dock Installation"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              },
              "9.9.2": {
                "activity": "Wooden Walkway Sanding and Staining"
              },
              "8.2.4": {
                "activity": "Wood Shingle Painting (Two Coats on a 2-3 Story Building)"
              }
            }
          },
          "9.10.3": {
            "activity": "Gangway Installation",
            "recommendedActivities": {
              "9.10.1": {
                "activity": "Boat Dock Installation"
              },
              "9.10.2": {
                "activity": "Cedar Dock Decking Installation for Boat Dock Systems"
              },
              "9.9.3": {
                "activity": "Wooden Walkway Removal"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              }
            }
          }
        }
      },
      "9.11": {
        "category": "Floating dock",
        "activities": {
          "9.11.1": {
            "activity": "10 ft. x 10 ft. Medium Freeboard Floating Dock Installation",
            "recommendedActivities": {
              "9.11.2": {
                "activity": "4 ft. x 10 ft. Commercial Grade Floating Dock Installation"
              },
              "9.11.3": {
                "activity": "8 ft. x 10 ft. Aluminum Floating Swim Raft with Resin Top and Resin Dock Installation"
              },
              "9.10.1": {
                "activity": "Boat Dock Installation"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              }
            }
          },
          "9.11.2": {
            "activity": "4 ft. x 10 ft. Commercial Grade Floating Dock Installation",
            "recommendedActivities": {
              "9.11.1": {
                "activity": "10 ft. x 10 ft. Medium Freeboard Floating Dock Installation"
              },
              "9.11.4": {
                "activity": "4 ft. x 10 ft. Aluminum Floating Dock with Resin Top Installation"
              },
              "9.10.2": {
                "activity": "Cedar Dock Decking Installation for Boat Dock Systems"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              }
            }
          },
          "9.11.3": {
            "activity": "8 ft. x 10 ft. Aluminum Floating Swim Raft with Resin Top and Resin Dock Installation",
            "recommendedActivities": {
              "9.11.1": {
                "activity": "10 ft. x 10 ft. Medium Freeboard Floating Dock Installation"
              },
              "9.11.4": {
                "activity": "4 ft. x 10 ft. Aluminum Floating Dock with Resin Top Installation"
              },
              "9.10.1": {
                "activity": "Boat Dock Installation"
              },
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              }
            }
          },
          "9.11.4": {
            "activity": "4 ft. x 10 ft. Aluminum Floating Dock with Resin Top Installation",
            "recommendedActivities": {
              "9.11.2": {
                "activity": "4 ft. x 10 ft. Commercial Grade Floating Dock Installation"
              },
              "9.11.3": {
                "activity": "8 ft. x 10 ft. Aluminum Floating Swim Raft with Resin Top and Resin Dock Installation"
              },
              "9.10.2": {
                "activity": "Cedar Dock Decking Installation for Boat Dock Systems"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              }
            }
          }
        }
      },
      "9.12": {
        "category": "Maintenance",
        "activities": {
          "9.12.1": {
            "activity": "Outdoor Carpentry Inspection and Assessment",
            "recommendedActivities": {
              "9.12.2": {
                "activity": "Outdoor Carpentry Pest Prevention"
              },
              "9.12.3": {
                "activity": "Outdoor Carpentry Refinishing"
              },
              "9.12.4": {
                "activity": "Outdoor Carpentry Winter Prep"
              },
              "9.12.5": {
                "activity": "Outdoor Carpentry Summer Prep"
              }
            }
          },
          "9.12.2": {
            "activity": "Outdoor Carpentry Pest Prevention",
            "recommendedActivities": {
              "9.12.1": {
                "activity": "Outdoor Carpentry Inspection and Assessment"
              },
              "9.12.3": {
                "activity": "Outdoor Carpentry Refinishing"
              },
              "9.12.4": {
                "activity": "Outdoor Carpentry Winter Prep"
              },
              "9.12.5": {
                "activity": "Outdoor Carpentry Summer Prep"
              }
            }
          },
          "9.12.3": {
            "activity": "Outdoor Carpentry Refinishing",
            "recommendedActivities": {
              "9.12.1": {
                "activity": "Outdoor Carpentry Inspection and Assessment"
              },
              "9.12.2": {
                "activity": "Outdoor Carpentry Pest Prevention"
              },
              "9.12.4": {
                "activity": "Outdoor Carpentry Winter Prep"
              },
              "9.12.5": {
                "activity": "Outdoor Carpentry Summer Prep"
              }
            }
          },
          "9.12.4": {
            "activity": "Outdoor Carpentry Winter Prep",
            "recommendedActivities": {
              "9.12.1": {
                "activity": "Outdoor Carpentry Inspection and Assessment"
              },
              "9.12.2": {
                "activity": "Outdoor Carpentry Pest Prevention"
              },
              "9.12.3": {
                "activity": "Outdoor Carpentry Refinishing"
              },
              "9.12.5": {
                "activity": "Outdoor Carpentry Summer Prep"
              }
            }
          },
          "9.12.5": {
            "activity": "Outdoor Carpentry Summer Prep",
            "recommendedActivities": {
              "9.12.1": {
                "activity": "Outdoor Carpentry Inspection and Assessment"
              },
              "9.12.2": {
                "activity": "Outdoor Carpentry Pest Prevention"
              },
              "9.12.3": {
                "activity": "Outdoor Carpentry Refinishing"
              },
              "9.12.4": {
                "activity": "Outdoor Carpentry Winter Prep"
              }
            }
          }
        }
      }
    }
  },
  "10": {
    "section": "Outdoor Electrical",
    "categories": {
      "10.1": {
        "category": "Electrical Panel",
        "activities": {
          "10.1.1": {
            "activity": "Outdoor Electrical Panel Installation",
            "recommendedActivities": {
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "10.1.4": {
                "activity": "Outdoor Electrical Panel Emergency Repairs"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              }
            }
          },
          "10.1.2": {
            "activity": "Circuit Breaker Replacement",
            "recommendedActivities": {
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "10.1.4": {
                "activity": "Outdoor Electrical Panel Emergency Repairs"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              }
            }
          },
          "10.1.3": {
            "activity": "Outdoor Electrical Panel Cleaning and Lubricating",
            "recommendedActivities": {
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "10.1.4": {
                "activity": "Outdoor Electrical Panel Emergency Repairs"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              }
            }
          },
          "10.1.4": {
            "activity": "Outdoor Electrical Panel Emergency Repairs",
            "recommendedActivities": {
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              }
            }
          },
          "10.1.5": {
            "activity": "Outdoor Electrical Panel Safety Inspection",
            "recommendedActivities": {
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "10.1.4": {
                "activity": "Outdoor Electrical Panel Emergency Repairs"
              }
            }
          }
        }
      },
      "10.2": {
        "category": "Outlet and Switch",
        "activities": {
          "10.2.1": {
            "activity": "Backyard Outlet Installation",
            "recommendedActivities": {
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "10.2.3": {
                "activity": "Backyard Outlet with Switch Installation"
              },
              "10.3.1": {
                "activity": "EV Charger Installation"
              },
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              }
            }
          },
          "10.2.2": {
            "activity": "Weatherproof Outlet Installation",
            "recommendedActivities": {
              "10.2.1": {
                "activity": "Backyard Outlet Installation"
              },
              "10.2.4": {
                "activity": "Power Pedestal for RV Installation"
              },
              "10.5.1": {
                "activity": "Wet Rated Outdoor Ceiling Fan Installation"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              }
            }
          },
          "10.2.3": {
            "activity": "Backyard Outlet with Switch Installation",
            "recommendedActivities": {
              "10.2.1": {
                "activity": "Backyard Outlet Installation"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "10.6.1": {
                "activity": "Outdoor Home Theater Installation"
              },
              "18.1.4": {
                "activity": "Hardwired Path Light Installation"
              }
            }
          },
          "10.2.4": {
            "activity": "Power Pedestal for RV Installation",
            "recommendedActivities": {
              "10.2.5": {
                "activity": "Running Power Cable for Installing a Power Pedestal"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.5.1": {
                "activity": "Wet Rated Outdoor Ceiling Fan Installation"
              }
            }
          },
          "10.2.5": {
            "activity": "Running Power Cable for Installing a Power Pedestal",
            "recommendedActivities": {
              "10.2.4": {
                "activity": "Power Pedestal for RV Installation"
              },
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "9.10.3": {
                "activity": "Gangway Installation"
              }
            }
          }
        }
      },
      "10.3": {
        "category": "EV Chargers",
        "activities": {
          "10.3.1": {
            "activity": "EV Charger Installation",
            "recommendedActivities": {
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              },
              "10.2.4": {
                "activity": "Power Pedestal for RV Installation"
              }
            }
          },
          "10.3.2": {
            "activity": "Running Power Cable for Installing an EV Charger",
            "recommendedActivities": {
              "10.3.1": {
                "activity": "EV Charger Installation"
              },
              "10.2.5": {
                "activity": "Running Power Cable for Installing a Power Pedestal"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "9.8.8": {
                "activity": "Outdoor Staircase Adjustable Ground Spike Foundation Installation"
              }
            }
          }
        }
      },
      "10.4": {
        "category": "Pool and Spa",
        "activities": {
          "10.4.1": {
            "activity": "Pool Heater Installation",
            "recommendedActivities": {
              "10.4.2": {
                "activity": "Pool Pump Motor Replacement"
              },
              "10.4.3": {
                "activity": "Sauna Heater Installation"
              },
              "10.4.4": {
                "activity": "Hot Tub Pump Installation"
              },
              "9.6.1": {
                "activity": "Outdoor Storage Concrete Slab Foundation Installation"
              }
            }
          },
          "10.4.2": {
            "activity": "Pool Pump Motor Replacement",
            "recommendedActivities": {
              "10.4.1": {
                "activity": "Pool Heater Installation"
              },
              "10.4.3": {
                "activity": "Sauna Heater Installation"
              },
              "10.4.4": {
                "activity": "Hot Tub Pump Installation"
              },
              "9.5.1": {
                "activity": "Outdoor Furniture Assembly"
              }
            }
          },
          "10.4.3": {
            "activity": "Sauna Heater Installation",
            "recommendedActivities": {
              "10.4.1": {
                "activity": "Pool Heater Installation"
              },
              "10.4.2": {
                "activity": "Pool Pump Motor Replacement"
              },
              "10.4.4": {
                "activity": "Hot Tub Pump Installation"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              }
            }
          },
          "10.4.4": {
            "activity": "Hot Tub Pump Installation",
            "recommendedActivities": {
              "10.4.1": {
                "activity": "Pool Heater Installation"
              },
              "10.4.2": {
                "activity": "Pool Pump Motor Replacement"
              },
              "10.4.3": {
                "activity": "Sauna Heater Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              }
            }
          }
        }
      },
      "10.5": {
        "category": "Ceiling Fans",
        "activities": {
          "10.5.1": {
            "activity": "Wet Rated Outdoor Ceiling Fan Installation",
            "recommendedActivities": {
              "10.5.2": {
                "activity": "Mounting Bracket and Canopy Replacement"
              },
              "10.5.3": {
                "activity": "Attach and Rebalance Blades"
              },
              "10.2.2": {
                "activity": "Weatherproof Outlet Installation"
              },
              "9.8.1": {
                "activity": "4-Step Outdoor Stair Installation"
              }
            }
          },
          "10.5.2": {
            "activity": "Mounting Bracket and Canopy Replacement",
            "recommendedActivities": {
              "10.5.1": {
                "activity": "Wet Rated Outdoor Ceiling Fan Installation"
              },
              "10.5.3": {
                "activity": "Attach and Rebalance Blades"
              },
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              },
              "9.9.2": {
                "activity": "Wooden Walkway Sanding and Staining"
              }
            }
          },
          "10.5.3": {
            "activity": "Attach and Rebalance Blades",
            "recommendedActivities": {
              "10.5.1": {
                "activity": "Wet Rated Outdoor Ceiling Fan Installation"
              },
              "10.5.2": {
                "activity": "Mounting Bracket and Canopy Replacement"
              },
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              }
            }
          }
        }
      },
      "10.6": {
        "category": "Audio-Visual",
        "activities": {
          "10.6.1": {
            "activity": "Outdoor Home Theater Installation",
            "recommendedActivities": {
              "10.6.2": {
                "activity": "Rock Speakers Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "9.1.4": {
                "activity": "Pressure-Treated Wood Decking Installation"
              }
            }
          },
          "10.6.2": {
            "activity": "Rock Speakers Installation",
            "recommendedActivities": {
              "10.6.1": {
                "activity": "Outdoor Home Theater Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "9.1.5": {
                "activity": "Composite Decking Installation"
              }
            }
          }
        }
      },
      "10.7": {
        "category": "Backup Power",
        "activities": {
          "10.7.1": {
            "activity": "Whole House Propane/Natural Gas Generator Installation",
            "recommendedActivities": {
              "10.7.2": {
                "activity": "Whole House Generator Maintenance"
              },
              "10.7.3": {
                "activity": "Battery Terminal Installation"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              }
            }
          },
          "10.7.2": {
            "activity": "Whole House Generator Maintenance",
            "recommendedActivities": {
              "10.7.1": {
                "activity": "Whole House Propane/Natural Gas Generator Installation"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "10.10.2": {
                "activity": "Outdoor Electrical Troubleshooting and Emergency Repairs"
              },
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              }
            }
          },
          "10.7.3": {
            "activity": "Battery Terminal Installation",
            "recommendedActivities": {
              "10.7.1": {
                "activity": "Whole House Propane/Natural Gas Generator Installation"
              },
              "10.7.5": {
                "activity": "Wind Turbine Foundation Installation"
              },
              "10.3.2": {
                "activity": "Running Power Cable for Installing an EV Charger"
              }
            }
          },
          "10.7.4": {
            "activity": "Wind Turbine Installation",
            "recommendedActivities": {
              "10.7.5": {
                "activity": "Wind Turbine Foundation Installation"
              },
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              }
            }
          },
          "10.7.5": {
            "activity": "Wind Turbine Foundation Installation",
            "recommendedActivities": {
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "10.7.3": {
                "activity": "Battery Terminal Installation"
              },
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              }
            }
          }
        }
      },
      "10.8": {
        "category": "Safety Inspections",
        "activities": {
          "10.8.1": {
            "activity": "Comprehensive System Evaluation",
            "recommendedActivities": {
              "10.8.2": {
                "activity": "Electrical Panel and Circuit Breakers Inspection"
              },
              "10.8.3": {
                "activity": "Outdoor Electrical Seasonal Preparation"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              },
              "10.7.2": {
                "activity": "Whole House Generator Maintenance"
              },
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              }
            }
          },
          "10.8.2": {
            "activity": "Electrical Panel and Circuit Breakers Inspection",
            "recommendedActivities": {
              "10.8.1": {
                "activity": "Comprehensive System Evaluation"
              },
              "10.1.5": {
                "activity": "Outdoor Electrical Panel Safety Inspection"
              },
              "10.10.1": {
                "activity": "Outdoor Electrical Regular Inspections"
              },
              "10.10.2": {
                "activity": "Outdoor Electrical Troubleshooting and Emergency Repairs"
              },
              "10.7.3": {
                "activity": "Battery Terminal Installation"
              }
            }
          },
          "10.8.3": {
            "activity": "Outdoor Electrical Seasonal Preparation",
            "recommendedActivities": {
              "10.8.1": {
                "activity": "Comprehensive System Evaluation"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "10.10.1": {
                "activity": "Outdoor Electrical Regular Inspections"
              },
              "10.10.3": {
                "activity": "Outdoor Electrical Wiring Maintenance"
              },
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              }
            }
          }
        }
      },
      "10.9": {
        "category": "Solar Panels",
        "activities": {
          "10.9.1": {
            "activity": "Off Grid Solar 2 kW System Installation",
            "recommendedActivities": {
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "10.8.1": {
                "activity": "Comprehensive System Evaluation"
              },
              "10.10.3": {
                "activity": "Outdoor Electrical Wiring Maintenance"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              }
            }
          },
          "10.9.2": {
            "activity": "Monocrystalline Solar Panels Installation",
            "recommendedActivities": {
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              },
              "10.7.4": {
                "activity": "Wind Turbine Installation"
              },
              "10.1.1": {
                "activity": "Outdoor Electrical Panel Installation"
              },
              "10.10.3": {
                "activity": "Outdoor Electrical Wiring Maintenance"
              },
              "11.7.2": {
                "activity": "Roof, Gutter and Solar Panel Cleaning Combo"
              }
            }
          }
        }
      },
      "10.10": {
        "category": "Maintenance",
        "activities": {
          "10.10.1": {
            "activity": "Outdoor Electrical Regular Inspections",
            "recommendedActivities": {
              "10.10.2": {
                "activity": "Outdoor Electrical Troubleshooting and Emergency Repairs"
              },
              "10.8.2": {
                "activity": "Electrical Panel and Circuit Breakers Inspection"
              },
              "10.7.2": {
                "activity": "Whole House Generator Maintenance"
              },
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              }
            }
          },
          "10.10.2": {
            "activity": "Outdoor Electrical Troubleshooting and Emergency Repairs",
            "recommendedActivities": {
              "10.10.1": {
                "activity": "Outdoor Electrical Regular Inspections"
              },
              "10.1.4": {
                "activity": "Outdoor Electrical Panel Emergency Repairs"
              },
              "10.1.2": {
                "activity": "Circuit Breaker Replacement"
              },
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "10.10.3": {
            "activity": "Outdoor Electrical Wiring Maintenance",
            "recommendedActivities": {
              "10.10.1": {
                "activity": "Outdoor Electrical Regular Inspections"
              },
              "10.8.3": {
                "activity": "Outdoor Electrical Seasonal Preparation"
              },
              "10.9.1": {
                "activity": "Off Grid Solar 2 kW System Installation"
              },
              "10.1.3": {
                "activity": "Outdoor Electrical Panel Cleaning and Lubricating"
              },
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              }
            }
          }
        }
      }
    }
  },
  "11": {
    "section": "Outdoor Cleaning",
    "categories": {
      "11.1": {
        "category": "Deck and Patio",
        "activities": {
          "11.1.1": {
            "activity": "Deck and Patio Pressure Washing",
            "recommendedActivities": {
              "11.1.2": {
                "activity": "Deck and Patio Soft Washing"
              },
              "11.1.3": {
                "activity": "Deck and Patio Deep Cleaning Solutions"
              },
              "8.3.4": {
                "activity": "Deck Priming and Painting"
              },
              "9.1.14": {
                "activity": "Deck Sanding, Staining, and Finishing"
              },
              "9.8.7": {
                "activity": "Outdoor Staircase Concrete Foundation Pillar and Columns Installation"
              }
            }
          },
          "11.1.2": {
            "activity": "Deck and Patio Soft Washing",
            "recommendedActivities": {
              "11.1.1": {
                "activity": "Deck and Patio Pressure Washing"
              },
              "11.1.3": {
                "activity": "Deck and Patio Deep Cleaning Solutions"
              },
              "8.3.2": {
                "activity": "Deck Coating (Acrylic Polymer)"
              },
              "9.1.14": {
                "activity": "Deck Sanding, Staining, and Finishing"
              },
              "9.1.6": {
                "activity": "Deck Stairs Installation (Up to 4 Feet)"
              }
            }
          },
          "11.1.3": {
            "activity": "Deck and Patio Deep Cleaning Solutions",
            "recommendedActivities": {
              "11.1.1": {
                "activity": "Deck and Patio Pressure Washing"
              },
              "11.1.2": {
                "activity": "Deck and Patio Soft Washing"
              },
              "8.3.1": {
                "activity": "Deck Staining and Finishing"
              },
              "9.1.12": {
                "activity": "Non-Slip Aluminum Nosing Installation"
              },
              "8.3.3": {
                "activity": "Deck Painting (One Coat)"
              }
            }
          }
        }
      },
      "11.2": {
        "category": "Driveway",
        "activities": {
          "11.2.1": {
            "activity": "Driveway Pressure Washing",
            "recommendedActivities": {
              "11.2.2": {
                "activity": "Driveway Soft Washing"
              },
              "11.2.3": {
                "activity": "Driveway Deep Cleaning Solutions"
              },
              "9.9.1": {
                "activity": "Wooden Walkway Installation"
              },
              "8.10.1": {
                "activity": "Concrete Epoxy Painting"
              },
              "20.10.2": {
                "activity": "Concrete Walkway and Path Installation"
              }
            }
          },
          "11.2.2": {
            "activity": "Driveway Soft Washing",
            "recommendedActivities": {
              "11.2.1": {
                "activity": "Driveway Pressure Washing"
              },
              "11.2.3": {
                "activity": "Driveway Deep Cleaning Solutions"
              },
              "9.9.2": {
                "activity": "Wooden Walkway Sanding and Staining"
              },
              "20.13.4": {
                "activity": "Driveway Drainage Solutions Installation"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              }
            }
          },
          "11.2.3": {
            "activity": "Driveway Deep Cleaning Solutions",
            "recommendedActivities": {
              "11.2.1": {
                "activity": "Driveway Pressure Washing"
              },
              "11.2.2": {
                "activity": "Driveway Soft Washing"
              },
              "20.13.4": {
                "activity": "Driveway Drainage Solutions Installation"
              },
              "8.10.2": {
                "activity": "Concrete Acrylic Latex Painting"
              },
              "20.10.6": {
                "activity": "Crushed Stone or Gravel Path Installation"
              }
            }
          }
        }
      },
      "11.3": {
        "category": "Hot Tub",
        "activities": {
          "11.3.1": {
            "activity": "Hot Tub Regular Cleaning",
            "recommendedActivities": {
              "11.3.2": {
                "activity": "Hot Tub Water Treatment and Cleaning"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "10.4.4": {
                "activity": "Hot Tub Pump Installation"
              },
              "11.9.1": {
                "activity": "Regular Outdoor Pool Cleaning"
              },
              "10.4.1": {
                "activity": "Pool Heater Installation"
              }
            }
          },
          "11.3.2": {
            "activity": "Hot Tub Water Treatment and Cleaning",
            "recommendedActivities": {
              "11.3.1": {
                "activity": "Hot Tub Regular Cleaning"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "11.9.2": {
                "activity": "Pool Shock Treatment"
              },
              "10.4.3": {
                "activity": "Sauna Heater Installation"
              },
              "11.9.3": {
                "activity": "Pool Filter and Equipment Maintenance"
              }
            }
          }
        }
      },
      "11.4": {
        "category": "House Washing",
        "activities": {
          "11.4.1": {
            "activity": "Vinyl Siding Cleaning",
            "recommendedActivities": {
              "11.4.2": {
                "activity": "Wood Siding Cleaning"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "23.2.3": {
                "activity": "Vinyl Siding Repair"
              },
              "8.1.3": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              }
            }
          },
          "11.4.2": {
            "activity": "Wood Siding Cleaning",
            "recommendedActivities": {
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "23.4.3": {
                "activity": "Natural Stone Installation on a Single-Story Building"
              },
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              }
            }
          },
          "11.4.3": {
            "activity": "Brick and Stone Cleaning",
            "recommendedActivities": {
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "11.4.2": {
                "activity": "Wood Siding Cleaning"
              },
              "23.3.5": {
                "activity": "Brick Veneer Pointing and Repointing"
              },
              "23.4.2": {
                "activity": "Stone Cladding Surface Preparation"
              },
              "23.12.4": {
                "activity": "Concrete & Masonry Waterproofing"
              }
            }
          }
        }
      },
      "11.5": {
        "category": "Fence",
        "activities": {
          "11.5.1": {
            "activity": "Fence Pressure Washing",
            "recommendedActivities": {
              "11.5.2": {
                "activity": "Fence Soft Washing"
              },
              "11.5.3": {
                "activity": "Fence Stain and Spot Removal"
              },
              "9.2.6": {
                "activity": "Metal Fence Installation"
              },
              "8.2.3": {
                "activity": "Wood Fence or Gate Sealing and Painting"
              },
              "8.2.4": {
                "activity": "Wood Fence Post Painting and Finishing"
              }
            }
          },
          "11.5.2": {
            "activity": "Fence Soft Washing",
            "recommendedActivities": {
              "11.5.1": {
                "activity": "Fence Pressure Washing"
              },
              "11.5.3": {
                "activity": "Fence Stain and Spot Removal"
              },
              "9.2.1": {
                "activity": "Premium Cedar Fence Installation"
              },
              "8.2.2": {
                "activity": "Wood Fence or Gate Staining"
              },
              "9.2.9": {
                "activity": "Driveway Metal Gate Installation"
              }
            }
          },
          "11.5.3": {
            "activity": "Fence Stain and Spot Removal",
            "recommendedActivities": {
              "11.5.1": {
                "activity": "Fence Pressure Washing"
              },
              "11.5.2": {
                "activity": "Fence Soft Washing"
              },
              "8.2.1": {
                "activity": "Ornamental Fence Priming and Painting"
              },
              "8.2.4": {
                "activity": "Wood Fence Post Painting and Finishing"
              },
              "9.2.2": {
                "activity": "Western Red Cedar Fence Installation"
              }
            }
          }
        }
      },
      "11.6": {
        "category": "Gutter",
        "activities": {
          "11.6.1": {
            "activity": "Gutter Debris Removal and Pressure Washing",
            "recommendedActivities": {
              "11.6.2": {
                "activity": "Gutter Cleaning Using Scaffold"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "23.11.2": {
                "activity": "Bird Spikes Installation"
              }
            }
          },
          "11.6.2": {
            "activity": "Gutter Cleaning Using Scaffold",
            "recommendedActivities": {
              "11.6.1": {
                "activity": "Gutter Debris Removal and Pressure Washing"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "23.11.3": {
                "activity": "Screening Installation"
              }
            }
          }
        }
      },
      "11.7": {
        "category": "Roof",
        "activities": {
          "11.7.1": {
            "activity": "Roof Soft Washing",
            "recommendedActivities": {
              "11.7.2": {
                "activity": "Roof, Gutter and Solar Panel Cleaning Combo"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.3.2": {
                "activity": "Metal Roof Painting"
              },
              "23.12.4": {
                "activity": "Concrete & Masonry Waterproofing"
              }
            }
          },
          "11.7.2": {
            "activity": "Roof, Gutter and Solar Panel Cleaning Combo",
            "recommendedActivities": {
              "11.7.1": {
                "activity": "Roof Soft Washing"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "10.9.2": {
                "activity": "Monocrystalline Solar Panels Installation"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          }
        }
      },
      "11.8": {
        "category": "Exterior Fixture",
        "activities": {
          "11.8.1": {
            "activity": "Outdoor Furniture Manual Cleaning",
            "recommendedActivities": {
              "11.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              },
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              },
              "22.1.1": {
                "activity": "Outdoor Grill Assembly"
              },
              "9.5.1": {
                "activity": "Outdoor Furniture Assembly"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              }
            }
          },
          "11.8.2": {
            "activity": "Exterior Lighting Fixture Cleaning",
            "recommendedActivities": {
              "11.8.1": {
                "activity": "Outdoor Furniture Manual Cleaning"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.4.1": {
                "activity": "Wall Pack Lights Installation"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              }
            }
          },
          "11.8.3": {
            "activity": "Exterior Decorative Element Cleaning",
            "recommendedActivities": {
              "11.8.1": {
                "activity": "Outdoor Furniture Manual Cleaning"
              },
              "18.1.3": {
                "activity": "Deck Post Lighting Installation"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              },
              "18.7.3": {
                "activity": "Medium Tree and Shrub Wrapping"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              }
            }
          }
        }
      },
      "11.9": {
        "category": "Pool",
        "activities": {
          "11.9.1": {
            "activity": "Regular Outdoor Pool Cleaning",
            "recommendedActivities": {
              "11.9.2": {
                "activity": "Pool Shock Treatment"
              },
              "11.9.3": {
                "activity": "Pool Filter and Equipment Maintenance"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              }
            }
          },
          "11.9.2": {
            "activity": "Pool Shock Treatment",
            "recommendedActivities": {
              "11.9.1": {
                "activity": "Regular Outdoor Pool Cleaning"
              },
              "11.9.3": {
                "activity": "Pool Filter and Equipment Maintenance"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              }
            }
          },
          "11.9.3": {
            "activity": "Pool Filter and Equipment Maintenance",
            "recommendedActivities": {
              "11.9.1": {
                "activity": "Regular Outdoor Pool Cleaning"
              },
              "11.9.2": {
                "activity": "Pool Shock Treatment"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              }
            }
          }
        }
      },
      "11.10": {
        "category": "Doors and Windows",
        "activities": {
          "11.10.1": {
            "activity": "Outdoor Glass Cleaning",
            "recommendedActivities": {
              "11.10.2": {
                "activity": "Outdoor Floor-to-Ceiling Glass Cleaning on a Single Storey Building"
              },
              "11.10.5": {
                "activity": "Garage Door Cleaning"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "11.10.2": {
            "activity": "Outdoor Floor-to-Ceiling Glass Cleaning on a Single Storey Building",
            "recommendedActivities": {
              "11.10.1": {
                "activity": "Outdoor Glass Cleaning"
              },
              "11.10.5": {
                "activity": "Garage Door Cleaning"
              },
              "23.7.1": {
                "activity": "Glass Blocks Installation"
              }
            }
          },
          "11.10.3": {
            "activity": "Outdoor Floor-to-Ceiling Glass Cleaning on a 2-4 Storey Building",
            "recommendedActivities": {
              "11.10.1": {
                "activity": "Outdoor Glass Cleaning"
              },
              "11.10.2": {
                "activity": "Outdoor Floor-to-Ceiling Glass Cleaning on a Single Storey Building"
              },
              "23.8.4": {
                "activity": "Fiber Cement Siding Installation on a 2-3 Story Building"
              }
            }
          },
          "11.10.4": {
            "activity": "Outdoor High-Rise Window Cleaning",
            "recommendedActivities": {
              "11.10.1": {
                "activity": "Outdoor Glass Cleaning"
              },
              "11.10.3": {
                "activity": "Outdoor Floor-to-Ceiling Glass Cleaning on a 2-4 Storey Building"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              }
            }
          },
          "11.10.5": {
            "activity": "Garage Door Cleaning",
            "recommendedActivities": {
              "11.10.1": {
                "activity": "Outdoor Glass Cleaning"
              },
              "8.5.5": {
                "activity": "Single Garage Door Opening and Trim Sealing and Painting"
              },
              "23.12.3": {
                "activity": "Graffiti Removal"
              }
            }
          }
        }
      }
    }
  },
  "18": {
    "section": "Outdoor Lighting",
    "categories": {
      "18.1": {
        "category": "Path Lights",
        "activities": {
          "18.1.1": {
            "activity": "Landscape Path Light Kit (6-10 lights) Installation",
            "recommendedActivities": {
              "18.1.4": {
                "activity": "Hardwired Path Light Installation"
              },
              "18.1.2": {
                "activity": "Solar LED In-Ground Path Light Installation"
              },
              "18.2.2": {
                "activity": "Deck/Step Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              }
            }
          },
          "18.1.2": {
            "activity": "Solar LED In-Ground Path Light Installation",
            "recommendedActivities": {
              "18.1.1": {
                "activity": "Landscape Path Light Kit (6-10 lights) Installation"
              },
              "18.1.4": {
                "activity": "Hardwired Path Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.1.3": {
                "activity": "Deck Post Lighting Installation"
              },
              "9.3.2": {
                "activity": "Pathway Paving Stone Installation"
              }
            }
          },
          "18.1.3": {
            "activity": "Deck Post Lighting Installation",
            "recommendedActivities": {
              "18.2.3": {
                "activity": "Deck Post Light Installation"
              },
              "18.1.2": {
                "activity": "Solar LED In-Ground Path Light Installation"
              },
              "18.2.2": {
                "activity": "Deck/Step Light Installation"
              },
              "9.1.12": {
                "activity": "Non-Slip Aluminum Nosing Installation"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          },
          "18.1.4": {
            "activity": "Hardwired Path Light Installation",
            "recommendedActivities": {
              "18.1.1": {
                "activity": "Landscape Path Light Kit (6-10 lights) Installation"
              },
              "18.1.2": {
                "activity": "Solar LED In-Ground Path Light Installation"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "9.5.3": {
                "activity": "Outdoor Lighting Timer Installation"
              }
            }
          }
        }
      },
      "18.2": {
        "category": "Deck and Patio",
        "activities": {
          "18.2.1": {
            "activity": "String Light Kit Installation",
            "recommendedActivities": {
              "18.2.2": {
                "activity": "Deck/Step Light Installation"
              },
              "18.1.3": {
                "activity": "Deck Post Lighting Installation"
              },
              "18.2.3": {
                "activity": "Deck Post Light Installation"
              },
              "18.1.4": {
                "activity": "Hardwired Path Light Installation"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          },
          "18.2.2": {
            "activity": "Deck/Step Light Installation",
            "recommendedActivities": {
              "18.2.1": {
                "activity": "String Light Kit Installation"
              },
              "18.2.3": {
                "activity": "Deck Post Light Installation"
              },
              "18.1.3": {
                "activity": "Deck Post Lighting Installation"
              },
              "9.1.12": {
                "activity": "Non-Slip Aluminum Nosing Installation"
              },
              "18.1.1": {
                "activity": "Landscape Path Light Kit (6-10 lights) Installation"
              }
            }
          },
          "18.2.3": {
            "activity": "Deck Post Light Installation",
            "recommendedActivities": {
              "18.1.3": {
                "activity": "Deck Post Lighting Installation"
              },
              "18.2.2": {
                "activity": "Deck/Step Light Installation"
              },
              "18.2.1": {
                "activity": "String Light Kit Installation"
              },
              "8.3.4": {
                "activity": "Deck Priming and Painting"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          }
        }
      },
      "18.3": {
        "category": "Wall Lights",
        "activities": {
          "18.3.1": {
            "activity": "Single-Story Wall Light Installation",
            "recommendedActivities": {
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.4.1": {
                "activity": "Wall Pack Lights Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              },
              "18.8.3": {
                "activity": "Exterior Decorative Element Cleaning"
              }
            }
          },
          "18.3.2": {
            "activity": "2-3 Story Wall Light Installation",
            "recommendedActivities": {
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "18.4.2": {
                "activity": "Area Lights Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "23.8.4": {
                "activity": "Fiber Cement Siding Installation on a 2-3 Story Building"
              },
              "18.4.1": {
                "activity": "Wall Pack Lights Installation"
              }
            }
          }
        }
      },
      "18.4": {
        "category": "Security Lighting",
        "activities": {
          "18.4.1": {
            "activity": "Wall Pack Lights Installation",
            "recommendedActivities": {
              "18.4.2": {
                "activity": "Area Lights Installation"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          },
          "18.4.2": {
            "activity": "Area Lights Installation",
            "recommendedActivities": {
              "18.4.1": {
                "activity": "Wall Pack Lights Installation"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          }
        }
      },
      "18.5": {
        "category": "Pool Lighting",
        "activities": {
          "18.5.1": {
            "activity": "Underwater Light Installation",
            "recommendedActivities": {
              "11.9.3": {
                "activity": "Pool Filter and Equipment Maintenance"
              },
              "11.9.1": {
                "activity": "Regular Outdoor Pool Cleaning"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "10.4.1": {
                "activity": "Pool Heater Installation"
              },
              "11.9.2": {
                "activity": "Pool Shock Treatment"
              }
            }
          }
        }
      },
      "18.6": {
        "category": "Smart Lighting",
        "activities": {
          "18.6.1": {
            "activity": "Smart Outdoor Lighting System Installation (7 lights)",
            "recommendedActivities": {
              "18.6.2": {
                "activity": "Smart Outdoor Lighting System Installation (15 lights)"
              },
              "18.1.1": {
                "activity": "Landscape Path Light Kit (6-10 lights) Installation"
              },
              "18.4.1": {
                "activity": "Wall Pack Lights Installation"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          },
          "18.6.2": {
            "activity": "Smart Outdoor Lighting System Installation (15 lights)",
            "recommendedActivities": {
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              },
              "18.1.2": {
                "activity": "Solar LED In-Ground Path Light Installation"
              },
              "18.4.2": {
                "activity": "Area Lights Installation"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.8.2": {
                "activity": "Exterior Lighting Fixture Cleaning"
              }
            }
          }
        }
      },
      "18.7": {
        "category": "Christmas Lights",
        "activities": {
          "18.7.1": {
            "activity": "Roofline and Eaves Installation on a One-Story Building",
            "recommendedActivities": {
              "18.7.2": {
                "activity": "Roofline and Eaves Installation on a 2-3 Story Building"
              },
              "18.7.3": {
                "activity": "Medium Tree and Shrub Wrapping"
              },
              "18.7.5": {
                "activity": "Christmas Lighting Installation from Customer Materials (Labor Only)"
              },
              "18.7.6": {
                "activity": "Christmas Lights Removal"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              }
            }
          },
          "18.7.2": {
            "activity": "Roofline and Eaves Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "18.7.1": {
                "activity": "Roofline and Eaves Installation on a One-Story Building"
              },
              "18.7.3": {
                "activity": "Medium Tree and Shrub Wrapping"
              },
              "18.7.4": {
                "activity": "Large Tree and Shrub Wrapping"
              },
              "18.7.6": {
                "activity": "Christmas Lights Removal"
              },
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              }
            }
          },
          "18.7.3": {
            "activity": "Medium Tree and Shrub Wrapping",
            "recommendedActivities": {
              "18.7.4": {
                "activity": "Large Tree and Shrub Wrapping"
              },
              "18.7.1": {
                "activity": "Roofline and Eaves Installation on a One-Story Building"
              },
              "18.7.6": {
                "activity": "Christmas Lights Removal"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              },
              "18.4.2": {
                "activity": "Area Lights Installation"
              }
            }
          },
          "18.7.4": {
            "activity": "Large Tree and Shrub Wrapping",
            "recommendedActivities": {
              "18.7.3": {
                "activity": "Medium Tree and Shrub Wrapping"
              },
              "18.7.6": {
                "activity": "Christmas Lights Removal"
              },
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              },
              "18.7.5": {
                "activity": "Christmas Lighting Installation from Customer Materials (Labor Only)"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              }
            }
          },
          "18.7.5": {
            "activity": "Christmas Lighting Installation from Customer Materials (Labor Only)",
            "recommendedActivities": {
              "18.7.6": {
                "activity": "Christmas Lights Removal"
              },
              "18.7.1": {
                "activity": "Roofline and Eaves Installation on a One-Story Building"
              },
              "18.7.2": {
                "activity": "Roofline and Eaves Installation on a 2-3 Story Building"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              },
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              }
            }
          },
          "18.7.6": {
            "activity": "Christmas Lights Removal",
            "recommendedActivities": {
              "18.7.5": {
                "activity": "Christmas Lighting Installation from Customer Materials (Labor Only)"
              },
              "18.7.1": {
                "activity": "Roofline and Eaves Installation on a One-Story Building"
              },
              "18.7.4": {
                "activity": "Large Tree and Shrub Wrapping"
              },
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              }
            }
          }
        }
      },
      "18.8": {
        "category": "Maintenance",
        "activities": {
          "18.8.1": {
            "activity": "Outdoor Fixture Cleaning",
            "recommendedActivities": {
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              },
              "18.8.3": {
                "activity": "Outdoor Electrical System Maintenance"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "18.1.1": {
                "activity": "Landscape Path Light Kit (6-10 lights) Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              }
            }
          },
          "18.8.2": {
            "activity": "Outdoor Bulb Replacement",
            "recommendedActivities": {
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              },
              "18.8.3": {
                "activity": "Outdoor Electrical System Maintenance"
              },
              "18.3.2": {
                "activity": "2-3 Story Wall Light Installation"
              },
              "18.4.2": {
                "activity": "Area Lights Installation"
              },
              "18.6.1": {
                "activity": "Smart Outdoor Lighting System Installation (7 lights)"
              }
            }
          },
          "18.8.3": {
            "activity": "Outdoor Electrical System Maintenance",
            "recommendedActivities": {
              "18.8.1": {
                "activity": "Outdoor Fixture Cleaning"
              },
              "18.8.2": {
                "activity": "Outdoor Bulb Replacement"
              },
              "18.3.1": {
                "activity": "Single-Story Wall Light Installation"
              },
              "10.10.1": {
                "activity": "Outdoor Electrical Regular Inspections"
              },
              "10.8.1": {
                "activity": "Comprehensive System Evaluation"
              }
            }
          }
        }
      }
    }
  },
  "19": {
    "section": "Roofing",
    "categories": {
      "19.1": {
        "category": "Leak Repair",
        "activities": {
          "19.1.1": {
            "activity": "Tile Roofing Repair",
            "recommendedActivities": {
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.1.4": {
                "activity": "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              }
            }
          },
          "19.1.2": {
            "activity": "Flashing Repair",
            "recommendedActivities": {
              "19.1.1": {
                "activity": "Tile Roofing Repair"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.1.4": {
                "activity": "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)"
              },
              "19.3.2": {
                "activity": "Metal Roof Painting"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "19.1.3": {
            "activity": "Temporary Leak Repairs",
            "recommendedActivities": {
              "19.1.1": {
                "activity": "Tile Roofing Repair"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.1.4": {
                "activity": "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.1.4": {
            "activity": "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)",
            "recommendedActivities": {
              "19.1.1": {
                "activity": "Tile Roofing Repair"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          }
        }
      },
      "19.2": {
        "category": "Shingle Roof",
        "activities": {
          "19.2.1": {
            "activity": "Shingle Roof Removal",
            "recommendedActivities": {
              "19.2.2": {
                "activity": "Laminate Shingle Roof Installation"
              },
              "19.2.3": {
                "activity": "Cedar Shingles Roof Installation"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              }
            }
          },
          "19.2.2": {
            "activity": "Laminate Shingle Roof Installation",
            "recommendedActivities": {
              "19.2.1": {
                "activity": "Shingle Roof Removal"
              },
              "19.2.3": {
                "activity": "Cedar Shingles Roof Installation"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.7.1": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              }
            }
          },
          "19.2.3": {
            "activity": "Cedar Shingles Roof Installation",
            "recommendedActivities": {
              "19.2.2": {
                "activity": "Laminate Shingle Roof Installation"
              },
              "19.2.1": {
                "activity": "Shingle Roof Removal"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              }
            }
          }
        }
      },
      "19.3": {
        "category": "Metal Roof",
        "activities": {
          "19.3.1": {
            "activity": "Metal Roof Installation",
            "recommendedActivities": {
              "19.3.2": {
                "activity": "Metal Roof Painting"
              },
              "19.3.3": {
                "activity": "Metal Roof Removal"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.7.1": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              }
            }
          },
          "19.3.2": {
            "activity": "Metal Roof Painting",
            "recommendedActivities": {
              "19.3.1": {
                "activity": "Metal Roof Installation"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "19.3.3": {
            "activity": "Metal Roof Removal",
            "recommendedActivities": {
              "19.3.1": {
                "activity": "Metal Roof Installation"
              },
              "19.3.2": {
                "activity": "Metal Roof Painting"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.2.1": {
                "activity": "Shingle Roof Removal"
              },
              "19.5.3": {
                "activity": "Bitumen Roof Removal"
              }
            }
          }
        }
      },
      "19.4": {
        "category": "Tile Roof",
        "activities": {
          "19.4.1": {
            "activity": "Tile Roof Repair",
            "recommendedActivities": {
              "19.1.1": {
                "activity": "Tile Roofing Repair"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              }
            }
          }
        }
      },
      "19.5": {
        "category": "Flat Roof",
        "activities": {
          "19.5.1": {
            "activity": "Elastomeric roof coating",
            "recommendedActivities": {
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              },
              "19.5.4": {
                "activity": "Silicone Reflective Roof Coating Installation"
              },
              "19.5.3": {
                "activity": "Bitumen Roof Removal"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              }
            }
          },
          "19.5.2": {
            "activity": "Self-Adhering Modified Bitumen Roof Installation",
            "recommendedActivities": {
              "19.5.1": {
                "activity": "Elastomeric roof coating"
              },
              "19.5.3": {
                "activity": "Bitumen Roof Removal"
              },
              "19.5.4": {
                "activity": "Silicone Reflective Roof Coating Installation"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "19.5.3": {
            "activity": "Bitumen Roof Removal",
            "recommendedActivities": {
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              },
              "19.5.1": {
                "activity": "Elastomeric roof coating"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.3.3": {
                "activity": "Metal Roof Removal"
              },
              "19.2.1": {
                "activity": "Shingle Roof Removal"
              }
            }
          },
          "19.5.4": {
            "activity": "Silicone Reflective Roof Coating Installation",
            "recommendedActivities": {
              "19.5.1": {
                "activity": "Elastomeric roof coating"
              },
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              },
              "19.6.3": {
                "activity": "Roof Underlayment Replacement"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          }
        }
      },
      "19.6": {
        "category": "Roof Inspection",
        "activities": {
          "19.6.1": {
            "activity": "Roof Leak Detection and Assessment",
            "recommendedActivities": {
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.6.3": {
                "activity": "Roof Damage Inspection"
              },
              "19.1.3": {
                "activity": "Temporary Leak Repairs"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.1.1": {
                "activity": "Tile Roofing Repair"
              }
            }
          },
          "19.6.2": {
            "activity": "Comprehensive Roof Inspection",
            "recommendedActivities": {
              "19.6.1": {
                "activity": "Roof Leak Detection and Assessment"
              },
              "19.6.3": {
                "activity": "Roof Damage Inspection"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              }
            }
          },
          "19.6.3": {
            "activity": "Roof Damage Inspection",
            "recommendedActivities": {
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.6.1": {
                "activity": "Roof Leak Detection and Assessment"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.1.4": {
                "activity": "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              }
            }
          },
          "19.6.4": {
            "activity": "Gutter and Drainage Evaluation",
            "recommendedActivities": {
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              }
            }
          }
        }
      },
      "19.7": {
        "category": "Gutter",
        "activities": {
          "19.7.1": {
            "activity": "Gutter Downspout Installation",
            "recommendedActivities": {
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              }
            }
          },
          "19.7.2": {
            "activity": "Drip Edge and Gutter Installation for Single-Story Houses",
            "recommendedActivities": {
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              }
            }
          },
          "19.7.3": {
            "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses",
            "recommendedActivities": {
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.7.4": {
            "activity": "Gutter Repair",
            "recommendedActivities": {
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              },
              "19.6.1": {
                "activity": "Roof Leak Detection and Assessment"
              }
            }
          },
          "19.7.5": {
            "activity": "Gutter Removal",
            "recommendedActivities": {
              "19.7.1": {
                "activity": "Gutter Downspout Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.7.3": {
                "activity": "Drip Edge and Gutter Installation for 2-3 Story Houses"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          }
        }
      },
      "19.8": {
        "category": "Roof Ventilation",
        "activities": {
          "19.8.1": {
            "activity": "Ridge Vent Installation",
            "recommendedActivities": {
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "19.8.4": {
                "activity": "Solar Powered Attic Fan Installation"
              },
              "19.8.2": {
                "activity": "Gravity Roof Ventilator Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.1.2": {
                "activity": "Flashing Repair"
              }
            }
          },
          "19.8.2": {
            "activity": "Gravity Roof Ventilator Installation",
            "recommendedActivities": {
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              },
              "19.8.3": {
                "activity": "Static Ventilator Installation"
              },
              "19.8.4": {
                "activity": "Solar Powered Attic Fan Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "19.8.3": {
            "activity": "Static Ventilator Installation",
            "recommendedActivities": {
              "19.8.2": {
                "activity": "Gravity Roof Ventilator Installation"
              },
              "19.8.5": {
                "activity": "Roof Turbines Installation"
              },
              "19.8.4": {
                "activity": "Solar Powered Attic Fan Installation"
              },
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.8.4": {
            "activity": "Solar Powered Attic Fan Installation",
            "recommendedActivities": {
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              },
              "19.8.5": {
                "activity": "Roof Turbines Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "19.3.2": {
                "activity": "Metal Roof Painting"
              },
              "19.6.4": {
                "activity": "Gutter and Drainage Evaluation"
              }
            }
          },
          "19.8.5": {
            "activity": "Roof Turbines Installation",
            "recommendedActivities": {
              "19.8.2": {
                "activity": "Gravity Roof Ventilator Installation"
              },
              "19.8.4": {
                "activity": "Solar Powered Attic Fan Installation"
              },
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.8.6": {
            "activity": "Roof Ventilation Maintenance",
            "recommendedActivities": {
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              },
              "19.8.5": {
                "activity": "Roof Turbines Installation"
              },
              "19.8.2": {
                "activity": "Gravity Roof Ventilator Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.6.3": {
                "activity": "Roof Damage Inspection"
              }
            }
          }
        }
      },
      "19.9": {
        "category": "Skylight",
        "activities": {
          "19.9.1": {
            "activity": "Tubular Skylights Installation",
            "recommendedActivities": {
              "19.9.2": {
                "activity": "Fixed Skylight Installation"
              },
              "19.9.3": {
                "activity": "Venting Skylight Installation"
              },
              "19.9.4": {
                "activity": "Curb-Mount Skylight Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              }
            }
          },
          "19.9.2": {
            "activity": "Fixed Skylight Installation",
            "recommendedActivities": {
              "19.9.1": {
                "activity": "Tubular Skylights Installation"
              },
              "19.9.3": {
                "activity": "Venting Skylight Installation"
              },
              "19.9.4": {
                "activity": "Curb-Mount Skylight Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              }
            }
          },
          "19.9.3": {
            "activity": "Venting Skylight Installation",
            "recommendedActivities": {
              "19.9.2": {
                "activity": "Fixed Skylight Installation"
              },
              "19.9.4": {
                "activity": "Curb-Mount Skylight Installation"
              },
              "19.9.1": {
                "activity": "Tubular Skylights Installation"
              },
              "19.8.4": {
                "activity": "Solar Powered Attic Fan Installation"
              },
              "19.8.6": {
                "activity": "Roof Ventilation Maintenance"
              }
            }
          },
          "19.9.4": {
            "activity": "Curb-Mount Skylight Installation",
            "recommendedActivities": {
              "19.9.2": {
                "activity": "Fixed Skylight Installation"
              },
              "19.9.1": {
                "activity": "Tubular Skylights Installation"
              },
              "19.9.3": {
                "activity": "Venting Skylight Installation"
              },
              "19.9.5": {
                "activity": "Skylight Removal"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.9.5": {
            "activity": "Skylight Removal",
            "recommendedActivities": {
              "19.9.2": {
                "activity": "Fixed Skylight Installation"
              },
              "19.9.3": {
                "activity": "Venting Skylight Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "19.8.1": {
                "activity": "Ridge Vent Installation"
              }
            }
          }
        }
      },
      "19.10": {
        "category": "Sheathing",
        "activities": {
          "19.10.1": {
            "activity": "OSB Sheathing Install",
            "recommendedActivities": {
              "19.10.2": {
                "activity": "Plywood Sheathing Installation"
              },
              "19.10.5": {
                "activity": "OSB Sheathing Removal"
              },
              "19.10.6": {
                "activity": "Plywood Sheathing Removal"
              },
              "19.3.1": {
                "activity": "Metal Roof Installation"
              },
              "19.2.2": {
                "activity": "Laminate Shingle Roof Installation"
              }
            }
          },
          "19.10.2": {
            "activity": "Plywood Sheathing Installation",
            "recommendedActivities": {
              "19.10.1": {
                "activity": "OSB Sheathing Install"
              },
              "19.10.3": {
                "activity": "Steep Roof Plywood Sheathing Installation"
              },
              "19.10.6": {
                "activity": "Plywood Sheathing Removal"
              },
              "19.2.2": {
                "activity": "Laminate Shingle Roof Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "19.10.3": {
            "activity": "Steep Roof Plywood Sheathing Installation",
            "recommendedActivities": {
              "19.10.2": {
                "activity": "Plywood Sheathing Installation"
              },
              "19.10.4": {
                "activity": "Steep Roof OSB Sheathing Installation"
              },
              "19.2.3": {
                "activity": "Cedar Shingles Roof Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.3.1": {
                "activity": "Metal Roof Installation"
              }
            }
          },
          "19.10.4": {
            "activity": "Steep Roof OSB Sheathing Installation",
            "recommendedActivities": {
              "19.10.3": {
                "activity": "Steep Roof Plywood Sheathing Installation"
              },
              "19.10.1": {
                "activity": "OSB Sheathing Install"
              },
              "19.10.5": {
                "activity": "OSB Sheathing Removal"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              }
            }
          },
          "19.10.5": {
            "activity": "OSB Sheathing Removal",
            "recommendedActivities": {
              "19.10.6": {
                "activity": "Plywood Sheathing Removal"
              },
              "19.10.1": {
                "activity": "OSB Sheathing Install"
              },
              "19.10.4": {
                "activity": "Steep Roof OSB Sheathing Installation"
              },
              "19.3.3": {
                "activity": "Metal Roof Removal"
              },
              "19.6.3": {
                "activity": "Roof Damage Inspection"
              }
            }
          },
          "19.10.6": {
            "activity": "Plywood Sheathing Removal",
            "recommendedActivities": {
              "19.10.5": {
                "activity": "OSB Sheathing Removal"
              },
              "19.10.2": {
                "activity": "Plywood Sheathing Installation"
              },
              "19.10.3": {
                "activity": "Steep Roof Plywood Sheathing Installation"
              },
              "19.2.1": {
                "activity": "Shingle Roof Removal"
              },
              "19.3.3": {
                "activity": "Metal Roof Removal"
              }
            }
          }
        }
      }
    }
  },
  "20": {
    "section": "Landscaping",
    "categories": {
      "20.1": {
        "category": "Lawn Maintenance",
        "activities": {
          "20.1.1": {
            "activity": "Regular Lawn Mowing",
            "recommendedActivities": {
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          },
          "20.1.2": {
            "activity": "Lawn Edging and Trimming",
            "recommendedActivities": {
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.7": {
                "activity": "Faded Grass Painting"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              }
            }
          },
          "20.1.3": {
            "activity": "Lawn Aeration and Scarifying",
            "recommendedActivities": {
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          },
          "20.1.4": {
            "activity": "Spring Lawn Revitalization",
            "recommendedActivities": {
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              },
              "20.1.7": {
                "activity": "Faded Grass Painting"
              }
            }
          },
          "20.1.5": {
            "activity": "Autumn Lawn Preparation",
            "recommendedActivities": {
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.7": {
                "activity": "Faded Grass Painting"
              }
            }
          },
          "20.1.6": {
            "activity": "Lawn Winterization",
            "recommendedActivities": {
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              }
            }
          },
          "20.1.7": {
            "activity": "Faded Grass Painting",
            "recommendedActivities": {
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          }
        }
      },
      "20.2": {
        "category": "Lawn Seeding",
        "activities": {
          "20.2.1": {
            "activity": "Lawn Hand Seeding",
            "recommendedActivities": {
              "20.2.2": {
                "activity": "Lawn Hydroseeding"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.2.5": {
                "activity": "Lawn Edging Installation"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          },
          "20.2.2": {
            "activity": "Lawn Hydroseeding",
            "recommendedActivities": {
              "20.2.1": {
                "activity": "Lawn Hand Seeding"
              },
              "20.2.3": {
                "activity": "Lawn Sod Installation"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.2.5": {
                "activity": "Lawn Edging Installation"
              }
            }
          },
          "20.2.3": {
            "activity": "Lawn Sod Installation",
            "recommendedActivities": {
              "20.2.2": {
                "activity": "Lawn Hydroseeding"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.2.5": {
                "activity": "Lawn Edging Installation"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              }
            }
          },
          "20.2.4": {
            "activity": "Artificial Grass Installation",
            "recommendedActivities": {
              "20.2.5": {
                "activity": "Lawn Edging Installation"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.1": {
                "activity": "Regular Lawn Mowing"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              },
              "20.1.7": {
                "activity": "Faded Grass Painting"
              }
            }
          },
          "20.2.5": {
            "activity": "Lawn Edging Installation",
            "recommendedActivities": {
              "20.2.1": {
                "activity": "Lawn Hand Seeding"
              },
              "20.2.3": {
                "activity": "Lawn Sod Installation"
              },
              "20.2.4": {
                "activity": "Artificial Grass Installation"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              }
            }
          }
        }
      },
      "20.3": {
        "category": "Tree Pruning",
        "activities": {
          "20.3.1": {
            "activity": "Tree Removal (Under 12\u201d Diameter, Large Canopy)",
            "recommendedActivities": {
              "20.3.2": {
                "activity": "Tree Removal (12\u201d to 24\u201d Diameter, Large Canopy)"
              },
              "20.3.4": {
                "activity": "Tree Stump Grinding"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              }
            }
          },
          "20.3.2": {
            "activity": "Tree Removal (12\u201d to 24\u201d Diameter, Large Canopy)",
            "recommendedActivities": {
              "20.3.3": {
                "activity": "Tree Removal (24\u201d to 36\u201d Diameter, Large Canopy)"
              },
              "20.3.4": {
                "activity": "Tree Stump Grinding"
              },
              "20.4.3": {
                "activity": "Large Tree Planting (Over 6\u2019 Tall)"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              }
            }
          },
          "20.3.3": {
            "activity": "Tree Removal (24\u201d to 36\u201d Diameter, Large Canopy)",
            "recommendedActivities": {
              "20.3.2": {
                "activity": "Tree Removal (12\u201d to 24\u201d Diameter, Large Canopy)"
              },
              "20.3.4": {
                "activity": "Tree Stump Grinding"
              },
              "20.4.3": {
                "activity": "Large Tree Planting (Over 6\u2019 Tall)"
              },
              "20.1.5": {
                "activity": "Autumn Lawn Preparation"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          },
          "20.3.4": {
            "activity": "Tree Stump Grinding",
            "recommendedActivities": {
              "20.3.1": {
                "activity": "Tree Removal (Under 12\u201d Diameter, Large Canopy)"
              },
              "20.3.2": {
                "activity": "Tree Removal (12\u201d to 24\u201d Diameter, Large Canopy)"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              }
            }
          },
          "20.3.5": {
            "activity": "Tree Formative Pruning",
            "recommendedActivities": {
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              }
            }
          }
        }
      },
      "20.4": {
        "category": "Planting",
        "activities": {
          "20.4.1": {
            "activity": "Small Tree Planting (Up to 2\u2019 Tall)",
            "recommendedActivities": {
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              }
            }
          },
          "20.4.2": {
            "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)",
            "recommendedActivities": {
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.4.3": {
                "activity": "Large Tree Planting (Over 6\u2019 Tall)"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              }
            }
          },
          "20.4.3": {
            "activity": "Large Tree Planting (Over 6\u2019 Tall)",
            "recommendedActivities": {
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.3.3": {
                "activity": "Tree Removal (24\u201d to 36\u201d Diameter, Large Canopy)"
              },
              "20.4.4": {
                "activity": "Medium Size Tree Relocation"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              }
            }
          },
          "20.4.4": {
            "activity": "Medium Size Tree Relocation",
            "recommendedActivities": {
              "20.4.3": {
                "activity": "Large Tree Planting (Over 6\u2019 Tall)"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.1.4": {
                "activity": "Spring Lawn Revitalization"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              }
            }
          },
          "20.4.5": {
            "activity": "Shrubs Planting",
            "recommendedActivities": {
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              }
            }
          },
          "20.4.6": {
            "activity": "Perennial Grasses Planting",
            "recommendedActivities": {
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.4.1": {
                "activity": "Small Tree Planting (Up to 2\u2019 Tall)"
              },
              "20.4.2": {
                "activity": "Medium Tree Planting (3\u2019 to 5\u2019 Tall)"
              },
              "20.1.2": {
                "activity": "Lawn Edging and Trimming"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              }
            }
          }
        }
      },
      "20.5": {
        "category": "Mulching",
        "activities": {
          "20.5.1": {
            "activity": "Organic Mulching (Up to 3\u201d Deep)",
            "recommendedActivities": {
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.5.5": {
                "activity": "Mulch Color Covering"
              }
            }
          },
          "20.5.2": {
            "activity": "Organic Mulching for Playgrounds",
            "recommendedActivities": {
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          },
          "20.5.3": {
            "activity": "Pea Gravel Pebble Mulching",
            "recommendedActivities": {
              "20.5.2": {
                "activity": "Organic Mulching for Playgrounds"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              }
            }
          },
          "20.5.4": {
            "activity": "Mulch Replacement and Top-Up",
            "recommendedActivities": {
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.5.2": {
                "activity": "Organic Mulching for Playgrounds"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              }
            }
          },
          "20.5.5": {
            "activity": "Mulch Color Covering",
            "recommendedActivities": {
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "20.5.2": {
                "activity": "Organic Mulching for Playgrounds"
              }
            }
          }
        }
      },
      "20.6": {
        "category": "Landscape Rocks",
        "activities": {
          "20.6.1": {
            "activity": "Ground Cover Rocks Installation",
            "recommendedActivities": {
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "20.6.2": {
            "activity": "Erosion Control Rocks Installation",
            "recommendedActivities": {
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.5.2": {
                "activity": "Organic Mulching for Playgrounds"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          },
          "20.6.3": {
            "activity": "Rock Wall Installation",
            "recommendedActivities": {
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          }
        }
      },
      "20.7": {
        "category": "Edging",
        "activities": {
          "20.7.1": {
            "activity": "Install Plastic Landscape Edging",
            "recommendedActivities": {
              "20.7.2": {
                "activity": "Install Metal Landscape Edging"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              }
            }
          },
          "20.7.2": {
            "activity": "Install Metal Landscape Edging",
            "recommendedActivities": {
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.8.2": {
                "activity": "Raised Garden Bed Installation (Corten Steel)"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          },
          "20.7.3": {
            "activity": "Install Natural Stone Landscape Edging",
            "recommendedActivities": {
              "20.7.2": {
                "activity": "Install Metal Landscape Edging"
              },
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.7.5": {
                "activity": "Install Wood Landscape Edging"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "20.8.3": {
                "activity": "Raised Garden Bed Installation (Galvanized Steel)"
              }
            }
          },
          "20.7.4": {
            "activity": "Install Brick Landscape Edging",
            "recommendedActivities": {
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.7.5": {
                "activity": "Install Wood Landscape Edging"
              },
              "20.7.6": {
                "activity": "Install Paver Landscape Edging"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              }
            }
          },
          "20.7.5": {
            "activity": "Install Wood Landscape Edging",
            "recommendedActivities": {
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.7.6": {
                "activity": "Install Paver Landscape Edging"
              },
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              }
            }
          },
          "20.7.6": {
            "activity": "Install Paver Landscape Edging",
            "recommendedActivities": {
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.7.5": {
                "activity": "Install Wood Landscape Edging"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          }
        }
      },
      "20.8": {
        "category": "Garden Beds",
        "activities": {
          "20.8.1": {
            "activity": "Raised Garden Bed Installation (Wood)",
            "recommendedActivities": {
              "20.8.2": {
                "activity": "Raised Garden Bed Installation (Corten Steel)"
              },
              "20.8.3": {
                "activity": "Raised Garden Bed Installation (Galvanized Steel)"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              }
            }
          },
          "20.8.2": {
            "activity": "Raised Garden Bed Installation (Corten Steel)",
            "recommendedActivities": {
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              },
              "20.8.3": {
                "activity": "Raised Garden Bed Installation (Galvanized Steel)"
              },
              "20.7.2": {
                "activity": "Install Metal Landscape Edging"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              }
            }
          },
          "20.8.3": {
            "activity": "Raised Garden Bed Installation (Galvanized Steel)",
            "recommendedActivities": {
              "20.8.2": {
                "activity": "Raised Garden Bed Installation (Corten Steel)"
              },
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              }
            }
          }
        }
      },
      "20.9": {
        "category": "Hedge",
        "activities": {
          "20.9.1": {
            "activity": "Hedge Planting",
            "recommendedActivities": {
              "20.9.2": {
                "activity": "Hedge Pruning"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              }
            }
          },
          "20.9.2": {
            "activity": "Hedge Pruning",
            "recommendedActivities": {
              "20.9.1": {
                "activity": "Hedge Planting"
              },
              "20.4.5": {
                "activity": "Shrubs Planting"
              },
              "20.3.5": {
                "activity": "Tree Formative Pruning"
              },
              "20.4.6": {
                "activity": "Perennial Grasses Planting"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          }
        }
      },
      "20.10": {
        "category": "Walkway and Path",
        "activities": {
          "20.10.1": {
            "activity": "Natural Path Installation",
            "recommendedActivities": {
              "20.10.6": {
                "activity": "Crushed Stone or Gravel Path Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.10.5": {
                "activity": "Stepping Stone Walkway and Path Installation"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              }
            }
          },
          "20.10.2": {
            "activity": "Concrete Walkway and Path Installation",
            "recommendedActivities": {
              "20.10.3": {
                "activity": "Pavers Walkway and Path Installation"
              },
              "20.10.4": {
                "activity": "Brick Walkway and Path Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "20.10.3": {
            "activity": "Pavers Walkway and Path Installation",
            "recommendedActivities": {
              "20.10.2": {
                "activity": "Concrete Walkway and Path Installation"
              },
              "20.10.4": {
                "activity": "Brick Walkway and Path Installation"
              },
              "20.7.6": {
                "activity": "Install Paver Landscape Edging"
              },
              "20.10.5": {
                "activity": "Stepping Stone Walkway and Path Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "20.10.4": {
            "activity": "Brick Walkway and Path Installation",
            "recommendedActivities": {
              "20.10.3": {
                "activity": "Pavers Walkway and Path Installation"
              },
              "20.10.2": {
                "activity": "Concrete Walkway and Path Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.7.4": {
                "activity": "Install Brick Landscape Edging"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              }
            }
          },
          "20.10.5": {
            "activity": "Stepping Stone Walkway and Path Installation",
            "recommendedActivities": {
              "20.10.6": {
                "activity": "Crushed Stone or Gravel Path Installation"
              },
              "20.7.3": {
                "activity": "Install Natural Stone Landscape Edging"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          },
          "20.10.6": {
            "activity": "Crushed Stone or Gravel Path Installation",
            "recommendedActivities": {
              "20.10.1": {
                "activity": "Natural Path Installation"
              },
              "20.10.5": {
                "activity": "Stepping Stone Walkway and Path Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              }
            }
          },
          "20.10.7": {
            "activity": "Surface Maintenance and Weed Control",
            "recommendedActivities": {
              "20.10.6": {
                "activity": "Crushed Stone or Gravel Path Installation"
              },
              "20.10.5": {
                "activity": "Stepping Stone Walkway and Path Installation"
              },
              "20.10.3": {
                "activity": "Pavers Walkway and Path Installation"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          }
        }
      },
      "20.11": {
        "category": "Water Features",
        "activities": {
          "20.11.1": {
            "activity": "Small Landscape Fountain Installation",
            "recommendedActivities": {
              "20.11.2": {
                "activity": "Preformed Pond Installation"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              }
            }
          },
          "20.11.2": {
            "activity": "Preformed Pond Installation",
            "recommendedActivities": {
              "20.11.1": {
                "activity": "Small Landscape Fountain Installation"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "20.11.3": {
            "activity": "Ponds and Fountains Maintenance",
            "recommendedActivities": {
              "20.11.1": {
                "activity": "Small Landscape Fountain Installation"
              },
              "20.11.2": {
                "activity": "Preformed Pond Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "20.12": {
        "category": "Irrigation System",
        "activities": {
          "20.12.1": {
            "activity": "Sprinkler Systems Installation",
            "recommendedActivities": {
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              },
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.1.3": {
                "activity": "Lawn Aeration and Scarifying"
              }
            }
          },
          "20.12.2": {
            "activity": "Irrigation Timers and Controllers Installation",
            "recommendedActivities": {
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.12.4": {
                "activity": "Raised Bed Garden Drip Irrigation System Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          },
          "20.12.3": {
            "activity": "Drip Irrigation System Installation",
            "recommendedActivities": {
              "20.12.4": {
                "activity": "Raised Bed Garden Drip Irrigation System Installation"
              },
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              },
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "20.12.4": {
            "activity": "Raised Bed Garden Drip Irrigation System Installation",
            "recommendedActivities": {
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              },
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              },
              "20.8.2": {
                "activity": "Raised Garden Bed Installation (Corten Steel)"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              }
            }
          },
          "20.12.5": {
            "activity": "Irrigation System Winterization",
            "recommendedActivities": {
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "20.1.6": {
                "activity": "Lawn Winterization"
              }
            }
          },
          "20.12.6": {
            "activity": "Irrigation System Maintenance",
            "recommendedActivities": {
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              },
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              },
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "20.13": {
        "category": "Drainage",
        "activities": {
          "20.13.1": {
            "activity": "French Drain System Installation",
            "recommendedActivities": {
              "20.13.5": {
                "activity": "Yard Drainage Solutions Installation"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "20.13.3": {
                "activity": "Landscape Drainage Solutions Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "20.13.2": {
            "activity": "Downspout Runoff Installation",
            "recommendedActivities": {
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.13.3": {
                "activity": "Landscape Drainage Solutions Installation"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "20.7.1": {
                "activity": "Install Plastic Landscape Edging"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              }
            }
          },
          "20.13.3": {
            "activity": "Landscape Drainage Solutions Installation",
            "recommendedActivities": {
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "20.13.4": {
                "activity": "Driveway Drainage Solutions Installation"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              }
            }
          },
          "20.13.4": {
            "activity": "Driveway Drainage Solutions Installation",
            "recommendedActivities": {
              "20.13.3": {
                "activity": "Landscape Drainage Solutions Installation"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              },
              "20.10.2": {
                "activity": "Concrete Walkway and Path Installation"
              }
            }
          },
          "20.13.5": {
            "activity": "Yard Drainage Solutions Installation",
            "recommendedActivities": {
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.13.3": {
                "activity": "Landscape Drainage Solutions Installation"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "20.12.1": {
                "activity": "Sprinkler Systems Installation"
              },
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              }
            }
          },
          "20.13.6": {
            "activity": "Drainage System Cleaning",
            "recommendedActivities": {
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.13.3": {
                "activity": "Landscape Drainage Solutions Installation"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "20.13.5": {
                "activity": "Yard Drainage Solutions Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              }
            }
          }
        }
      },
      "20.14": {
        "category": "Greenhouses",
        "activities": {
          "20.14.1": {
            "activity": "Aluminum Frame Greenhouse Installation",
            "recommendedActivities": {
              "20.14.2": {
                "activity": "Metal Orangerie Installation"
              },
              "20.14.3": {
                "activity": "Greenhouse Seasonal Cleaning"
              },
              "20.12.3": {
                "activity": "Drip Irrigation System Installation"
              },
              "20.8.1": {
                "activity": "Raised Garden Bed Installation (Wood)"
              },
              "20.5.1": {
                "activity": "Organic Mulching (Up to 3\u201d Deep)"
              }
            }
          },
          "20.14.2": {
            "activity": "Metal Orangerie Installation",
            "recommendedActivities": {
              "20.14.1": {
                "activity": "Aluminum Frame Greenhouse Installation"
              },
              "20.14.3": {
                "activity": "Greenhouse Seasonal Cleaning"
              },
              "20.12.4": {
                "activity": "Raised Bed Garden Drip Irrigation System Installation"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              }
            }
          },
          "20.14.3": {
            "activity": "Greenhouse Seasonal Cleaning",
            "recommendedActivities": {
              "20.14.1": {
                "activity": "Aluminum Frame Greenhouse Installation"
              },
              "20.14.2": {
                "activity": "Metal Orangerie Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          }
        }
      }
    }
  },
  "22": {
    "section": "Outdoor Appliance",
    "categories": {
      "22.1": {
        "category": "Grills",
        "activities": {
          "22.1.1": {
            "activity": "Outdoor Grill Assembly",
            "recommendedActivities": {
              "22.1.2": {
                "activity": "Outdoor Grill Cleaning"
              },
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              }
            }
          },
          "22.1.2": {
            "activity": "Outdoor Grill Cleaning",
            "recommendedActivities": {
              "22.1.1": {
                "activity": "Outdoor Grill Assembly"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              }
            }
          }
        }
      },
      "22.2": {
        "category": "Outdoor Kitchen",
        "activities": {
          "22.2.1": {
            "activity": "Outdoor Kitchen Cabinets Installation",
            "recommendedActivities": {
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.3": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              }
            }
          },
          "22.2.2": {
            "activity": "Outdoor Kitchen Built-In Grill Installation",
            "recommendedActivities": {
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.1.1": {
                "activity": "Outdoor Grill Assembly"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              },
              "20.12.6": {
                "activity": "Irrigation System Maintenance"
              }
            }
          },
          "22.2.3": {
            "activity": "Outdoor Kitchen Built-In Grill Installation",
            "recommendedActivities": {
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              }
            }
          },
          "22.2.4": {
            "activity": "Outdoor Kitchen Sink Installation",
            "recommendedActivities": {
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.3": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              }
            }
          },
          "22.2.5": {
            "activity": "Outdoor Kitchen Cleaning",
            "recommendedActivities": {
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.1.2": {
                "activity": "Outdoor Grill Cleaning"
              },
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              }
            }
          },
          "22.2.6": {
            "activity": "Outdoor Kitchen Removal",
            "recommendedActivities": {
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.1.2": {
                "activity": "Outdoor Grill Cleaning"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "20.12.5": {
                "activity": "Irrigation System Winterization"
              }
            }
          }
        }
      },
      "22.3": {
        "category": "Fire Pit",
        "activities": {
          "22.3.1": {
            "activity": "Fire Pit Kit Installation",
            "recommendedActivities": {
              "22.3.2": {
                "activity": "Seat Wall Installation"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.3.4": {
                "activity": "Fire Pit Removal"
              },
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              }
            }
          },
          "22.3.2": {
            "activity": "Seat Wall Installation",
            "recommendedActivities": {
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "22.4.2": {
                "activity": "Compact Wood Box Installation"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.3.4": {
                "activity": "Fire Pit Removal"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              }
            }
          },
          "22.3.3": {
            "activity": "Fire Pit Cleaning",
            "recommendedActivities": {
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "22.3.4": {
                "activity": "Fire Pit Removal"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "22.3.4": {
            "activity": "Fire Pit Removal",
            "recommendedActivities": {
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              }
            }
          }
        }
      },
      "22.4": {
        "category": "Fireplace",
        "activities": {
          "22.4.1": {
            "activity": "Compact Outdoor Fireplace Installation",
            "recommendedActivities": {
              "22.4.2": {
                "activity": "Compact Wood Box Installation"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              },
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "22.3.2": {
                "activity": "Seat Wall Installation"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              }
            }
          },
          "22.4.2": {
            "activity": "Compact Wood Box Installation",
            "recommendedActivities": {
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              },
              "22.3.2": {
                "activity": "Seat Wall Installation"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              }
            }
          },
          "22.4.3": {
            "activity": "Compact Outdoor Hearth Installation",
            "recommendedActivities": {
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.4.2": {
                "activity": "Compact Wood Box Installation"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              },
              "22.3.2": {
                "activity": "Seat Wall Installation"
              }
            }
          },
          "22.4.4": {
            "activity": "Fireplace Cleaning",
            "recommendedActivities": {
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              },
              "22.3.4": {
                "activity": "Fire Pit Removal"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              }
            }
          },
          "22.4.5": {
            "activity": "Fireplace Removal",
            "recommendedActivities": {
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.3.4": {
                "activity": "Fire Pit Removal"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "22.5": {
        "category": "Patio Heater",
        "activities": {
          "22.5.1": {
            "activity": "Infrared Ceiling-Mounted Electric Heater Installation",
            "recommendedActivities": {
              "22.5.2": {
                "activity": "Infrared Electric Heater Replacement"
              },
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "20.12.2": {
                "activity": "Irrigation Timers and Controllers Installation"
              },
              "22.6.1": {
                "activity": "Hot Tub Installation"
              }
            }
          },
          "22.5.2": {
            "activity": "Infrared Electric Heater Replacement",
            "recommendedActivities": {
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              }
            }
          }
        }
      },
      "22.6": {
        "category": "Hot Tubs",
        "activities": {
          "22.6.1": {
            "activity": "Hot Tub Installation",
            "recommendedActivities": {
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              },
              "22.4.1": {
                "activity": "Compact Outdoor Fireplace Installation"
              },
              "22.3.1": {
                "activity": "Fire Pit Kit Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "22.6.2": {
            "activity": "Hot Tub Maintenance",
            "recommendedActivities": {
              "22.6.1": {
                "activity": "Hot Tub Installation"
              },
              "22.5.2": {
                "activity": "Infrared Electric Heater Replacement"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              }
            }
          }
        }
      },
      "22.7": {
        "category": "Pool",
        "activities": {
          "22.7.1": {
            "activity": "Swimming Pool Site Preparation",
            "recommendedActivities": {
              "22.7.2": {
                "activity": "Hard-Sided Swimming Pool Installation"
              },
              "22.7.3": {
                "activity": "Frame Swimming Pool Installation"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              },
              "22.7.4": {
                "activity": "Cartridge Pool Filter Replacement"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              }
            }
          },
          "22.7.2": {
            "activity": "Hard-Sided Swimming Pool Installation",
            "recommendedActivities": {
              "22.7.1": {
                "activity": "Swimming Pool Site Preparation"
              },
              "22.7.3": {
                "activity": "Frame Swimming Pool Installation"
              },
              "22.7.4": {
                "activity": "Cartridge Pool Filter Replacement"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              }
            }
          },
          "22.7.3": {
            "activity": "Frame Swimming Pool Installation",
            "recommendedActivities": {
              "22.7.1": {
                "activity": "Swimming Pool Site Preparation"
              },
              "22.7.2": {
                "activity": "Hard-Sided Swimming Pool Installation"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              }
            }
          },
          "22.7.4": {
            "activity": "Cartridge Pool Filter Replacement",
            "recommendedActivities": {
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              },
              "22.7.1": {
                "activity": "Swimming Pool Site Preparation"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              }
            }
          },
          "22.7.5": {
            "activity": "Outdoor Pool Pump Replacement",
            "recommendedActivities": {
              "22.7.4": {
                "activity": "Cartridge Pool Filter Replacement"
              },
              "22.7.1": {
                "activity": "Swimming Pool Site Preparation"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              },
              "22.6.1": {
                "activity": "Hot Tub Installation"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              }
            }
          },
          "22.7.6": {
            "activity": "Outdoor Pool Winterization",
            "recommendedActivities": {
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              },
              "22.7.4": {
                "activity": "Cartridge Pool Filter Replacement"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              },
              "22.6.1": {
                "activity": "Hot Tub Installation"
              }
            }
          },
          "22.7.7": {
            "activity": "Outdoor Pool Opening",
            "recommendedActivities": {
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              },
              "22.7.4": {
                "activity": "Cartridge Pool Filter Replacement"
              },
              "22.7.3": {
                "activity": "Frame Swimming Pool Installation"
              },
              "22.7.2": {
                "activity": "Hard-Sided Swimming Pool Installation"
              }
            }
          }
        }
      },
      "22.8": {
        "category": "Refrigeration",
        "activities": {
          "22.8.1": {
            "activity": "Built-In Outdoor Cooler Installation",
            "recommendedActivities": {
              "22.8.2": {
                "activity": "Outdoor Refrigeration Electrical Repair"
              },
              "22.8.3": {
                "activity": "Outdoor Refrigeration System Maintenance"
              },
              "22.2.2": {
                "activity": "Outdoor Kitchen Built-In Grill Installation"
              },
              "22.2.4": {
                "activity": "Outdoor Kitchen Sink Installation"
              },
              "22.9.1": {
                "activity": "Outdoor Mist Cooling System for Small to Midsize Patio Installation"
              }
            }
          },
          "22.8.2": {
            "activity": "Outdoor Refrigeration Electrical Repair",
            "recommendedActivities": {
              "22.8.3": {
                "activity": "Outdoor Refrigeration System Maintenance"
              },
              "22.8.1": {
                "activity": "Built-In Outdoor Cooler Installation"
              },
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "22.9.2": {
                "activity": "Outdoor Mist Cooling System for Mid to Large Patio Installation"
              }
            }
          },
          "22.8.3": {
            "activity": "Outdoor Refrigeration System Maintenance",
            "recommendedActivities": {
              "22.8.1": {
                "activity": "Built-In Outdoor Cooler Installation"
              },
              "22.8.2": {
                "activity": "Outdoor Refrigeration Electrical Repair"
              },
              "22.5.2": {
                "activity": "Infrared Electric Heater Replacement"
              },
              "22.2.6": {
                "activity": "Outdoor Kitchen Removal"
              },
              "22.9.1": {
                "activity": "Outdoor Mist Cooling System for Small to Midsize Patio Installation"
              }
            }
          }
        }
      },
      "22.9": {
        "category": "Outdoor Cooling",
        "activities": {
          "22.9.1": {
            "activity": "Outdoor Mist Cooling System for Small to Midsize Patio Installation",
            "recommendedActivities": {
              "22.9.2": {
                "activity": "Outdoor Mist Cooling System for Mid to Large Patio Installation"
              },
              "22.8.1": {
                "activity": "Built-In Outdoor Cooler Installation"
              },
              "22.8.3": {
                "activity": "Outdoor Refrigeration System Maintenance"
              },
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              }
            }
          },
          "22.9.2": {
            "activity": "Outdoor Mist Cooling System for Mid to Large Patio Installation",
            "recommendedActivities": {
              "22.9.1": {
                "activity": "Outdoor Mist Cooling System for Small to Midsize Patio Installation"
              },
              "22.8.2": {
                "activity": "Outdoor Refrigeration Electrical Repair"
              },
              "22.8.3": {
                "activity": "Outdoor Refrigeration System Maintenance"
              },
              "22.5.2": {
                "activity": "Infrared Electric Heater Replacement"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              }
            }
          }
        }
      }
    }
  },
  "23": {
    "section": "Facade",
    "categories": {
      "23.1": {
        "category": "Underlayment",
        "activities": {
          "23.1.1": {
            "activity": "Wooden Clapboard Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.1.2": {
                "activity": "Wooden Clapboard Siding Installation on a 2-3 Story Building"
              },
              "23.1.3": {
                "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building"
              },
              "23.1.5": {
                "activity": "Plywood Siding Panel Installation on a Single-Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              }
            }
          },
          "23.1.2": {
            "activity": "Wooden Clapboard Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "23.1.4": {
                "activity": "Cedar Wood Shingle Siding Installation on a 2-3 Story Building"
              },
              "23.1.6": {
                "activity": "Plywood Siding Panel Installation on a 2-3 Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "23.1.3": {
            "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "23.1.4": {
                "activity": "Cedar Wood Shingle Siding Installation on a 2-3 Story Building"
              },
              "23.1.7": {
                "activity": "Grid Siding Board Installation on a Single-Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              }
            }
          },
          "23.1.4": {
            "activity": "Cedar Wood Shingle Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.1.2": {
                "activity": "Wooden Clapboard Siding Installation on a 2-3 Story Building"
              },
              "23.1.3": {
                "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building"
              },
              "23.1.8": {
                "activity": "Grid Siding Board Installation on a 2-3 Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "23.1.5": {
            "activity": "Plywood Siding Panel Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "23.1.6": {
                "activity": "Plywood Siding Panel Installation on a 2-3 Story Building"
              },
              "23.1.7": {
                "activity": "Grid Siding Board Installation on a Single-Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "20.11.3": {
                "activity": "Ponds and Fountains Maintenance"
              }
            }
          },
          "23.1.6": {
            "activity": "Plywood Siding Panel Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.1.2": {
                "activity": "Wooden Clapboard Siding Installation on a 2-3 Story Building"
              },
              "23.1.5": {
                "activity": "Plywood Siding Panel Installation on a Single-Story Building"
              },
              "23.1.8": {
                "activity": "Grid Siding Board Installation on a 2-3 Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "22.9.2": {
                "activity": "Outdoor Mist Cooling System for Mid to Large Patio Installation"
              }
            }
          },
          "23.1.7": {
            "activity": "Grid Siding Board Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.1.5": {
                "activity": "Plywood Siding Panel Installation on a Single-Story Building"
              },
              "23.1.8": {
                "activity": "Grid Siding Board Installation on a 2-3 Story Building"
              },
              "23.1.3": {
                "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              }
            }
          },
          "23.1.8": {
            "activity": "Grid Siding Board Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.1.6": {
                "activity": "Plywood Siding Panel Installation on a 2-3 Story Building"
              },
              "23.1.7": {
                "activity": "Grid Siding Board Installation on a Single-Story Building"
              },
              "23.1.4": {
                "activity": "Cedar Wood Shingle Siding Installation on a 2-3 Story Building"
              },
              "23.1.9": {
                "activity": "Wood Siding Removal"
              },
              "22.6.1": {
                "activity": "Hot Tub Installation"
              }
            }
          },
          "23.1.9": {
            "activity": "Wood Siding Removal",
            "recommendedActivities": {
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "23.1.2": {
                "activity": "Wooden Clapboard Siding Installation on a 2-3 Story Building"
              },
              "23.1.3": {
                "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building"
              },
              "23.1.4": {
                "activity": "Cedar Wood Shingle Siding Installation on a 2-3 Story Building"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "23.2": {
        "category": "Vinyl Siding",
        "activities": {
          "23.2.1": {
            "activity": "Vinyl Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.2.2": {
                "activity": "Vinyl Siding Installation on a 2-3 Story Building"
              },
              "23.2.3": {
                "activity": "Vinyl Siding Repair"
              },
              "23.2.4": {
                "activity": "Vinyl Siding Removal"
              },
              "20.10.2": {
                "activity": "Concrete Walkway and Path Installation"
              },
              "22.5.1": {
                "activity": "Infrared Ceiling-Mounted Electric Heater Installation"
              }
            }
          },
          "23.2.2": {
            "activity": "Vinyl Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.2.1": {
                "activity": "Vinyl Siding Installation on a Single-Story Building"
              },
              "23.2.3": {
                "activity": "Vinyl Siding Repair"
              },
              "23.2.4": {
                "activity": "Vinyl Siding Removal"
              },
              "20.10.6": {
                "activity": "Crushed Stone or Gravel Path Installation"
              },
              "22.6.2": {
                "activity": "Hot Tub Maintenance"
              }
            }
          },
          "23.2.3": {
            "activity": "Vinyl Siding Repair",
            "recommendedActivities": {
              "23.2.1": {
                "activity": "Vinyl Siding Installation on a Single-Story Building"
              },
              "23.2.2": {
                "activity": "Vinyl Siding Installation on a 2-3 Story Building"
              },
              "23.2.4": {
                "activity": "Vinyl Siding Removal"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              },
              "20.6.1": {
                "activity": "Ground Cover Rocks Installation"
              }
            }
          },
          "23.2.4": {
            "activity": "Vinyl Siding Removal",
            "recommendedActivities": {
              "23.2.1": {
                "activity": "Vinyl Siding Installation on a Single-Story Building"
              },
              "23.2.2": {
                "activity": "Vinyl Siding Installation on a 2-3 Story Building"
              },
              "23.2.3": {
                "activity": "Vinyl Siding Repair"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "22.3.3": {
                "activity": "Fire Pit Cleaning"
              }
            }
          }
        }
      },
      "23.3": {
        "category": "Brick Veneer",
        "activities": {
          "23.3.1": {
            "activity": "Thin Brick Veneer Removal",
            "recommendedActivities": {
              "23.3.2": {
                "activity": "Thin Brick Veneer Installation on a Single-Story Building"
              },
              "23.3.3": {
                "activity": "Thin Brick Veneer Installation on a 2-3 Story Building"
              },
              "23.3.4": {
                "activity": "Brick Veneer Sealing"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              }
            }
          },
          "23.3.2": {
            "activity": "Thin Brick Veneer Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.3.3": {
                "activity": "Thin Brick Veneer Installation on a 2-3 Story Building"
              },
              "23.3.4": {
                "activity": "Brick Veneer Sealing"
              },
              "23.3.5": {
                "activity": "Brick Veneer Pointing and Repointing"
              },
              "22.7.7": {
                "activity": "Outdoor Pool Opening"
              },
              "20.13.5": {
                "activity": "Yard Drainage Solutions Installation"
              }
            }
          },
          "23.3.3": {
            "activity": "Thin Brick Veneer Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.3.2": {
                "activity": "Thin Brick Veneer Installation on a Single-Story Building"
              },
              "23.3.4": {
                "activity": "Brick Veneer Sealing"
              },
              "23.3.6": {
                "activity": "Brick Veneer Damage Repair"
              },
              "22.9.2": {
                "activity": "Outdoor Mist Cooling System for Mid to Large Patio Installation"
              },
              "20.10.5": {
                "activity": "Stepping Stone Walkway and Path Installation"
              }
            }
          },
          "23.3.4": {
            "activity": "Brick Veneer Sealing",
            "recommendedActivities": {
              "23.3.5": {
                "activity": "Brick Veneer Pointing and Repointing"
              },
              "23.3.6": {
                "activity": "Brick Veneer Damage Repair"
              },
              "23.3.2": {
                "activity": "Thin Brick Veneer Installation on a Single-Story Building"
              },
              "23.3.3": {
                "activity": "Thin Brick Veneer Installation on a 2-3 Story Building"
              },
              "22.4.3": {
                "activity": "Compact Outdoor Hearth Installation"
              }
            }
          },
          "23.3.5": {
            "activity": "Brick Veneer Pointing and Repointing",
            "recommendedActivities": {
              "23.3.4": {
                "activity": "Brick Veneer Sealing"
              },
              "23.3.6": {
                "activity": "Brick Veneer Damage Repair"
              },
              "23.3.1": {
                "activity": "Thin Brick Veneer Removal"
              },
              "22.2.5": {
                "activity": "Outdoor Kitchen Cleaning"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          },
          "23.3.6": {
            "activity": "Brick Veneer Damage Repair",
            "recommendedActivities": {
              "23.3.4": {
                "activity": "Brick Veneer Sealing"
              },
              "23.3.5": {
                "activity": "Brick Veneer Pointing and Repointing"
              },
              "23.3.2": {
                "activity": "Thin Brick Veneer Installation on a Single-Story Building"
              },
              "23.3.3": {
                "activity": "Thin Brick Veneer Installation on a 2-3 Story Building"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              }
            }
          }
        }
      },
      "23.4": {
        "category": "Stone Cladding",
        "activities": {
          "23.4.1": {
            "activity": "Old Cladding Removal",
            "recommendedActivities": {
              "23.4.2": {
                "activity": "Stone Cladding Surface Preparation"
              },
              "23.4.3": {
                "activity": "Natural Stone Installation on a Single-Story Building"
              },
              "23.4.4": {
                "activity": "Natural Stone Installation on a 2-3 Story Building"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "23.4.2": {
            "activity": "Stone Cladding Surface Preparation",
            "recommendedActivities": {
              "23.4.1": {
                "activity": "Old Cladding Removal"
              },
              "23.4.3": {
                "activity": "Natural Stone Installation on a Single-Story Building"
              },
              "23.4.5": {
                "activity": "Manufactured Stone Veneer Installation on a Single-Story Building"
              },
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "20.6.2": {
                "activity": "Erosion Control Rocks Installation"
              }
            }
          },
          "23.4.3": {
            "activity": "Natural Stone Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.4.4": {
                "activity": "Natural Stone Installation on a 2-3 Story Building"
              },
              "23.4.5": {
                "activity": "Manufactured Stone Veneer Installation on a Single-Story Building"
              },
              "23.4.7": {
                "activity": "Faux Stone Siding Installation on a Single-Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              }
            }
          },
          "23.4.4": {
            "activity": "Natural Stone Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.4.3": {
                "activity": "Natural Stone Installation on a Single-Story Building"
              },
              "23.4.6": {
                "activity": "Manufactured Stone Veneer Installation on a 2-3 Story Building"
              },
              "23.4.8": {
                "activity": "Faux Stone Siding Installation on a 2-3 Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              }
            }
          },
          "23.4.5": {
            "activity": "Manufactured Stone Veneer Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.4.6": {
                "activity": "Manufactured Stone Veneer Installation on a 2-3 Story Building"
              },
              "23.4.7": {
                "activity": "Faux Stone Siding Installation on a Single-Story Building"
              },
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "20.5.3": {
                "activity": "Pea Gravel Pebble Mulching"
              }
            }
          },
          "23.4.6": {
            "activity": "Manufactured Stone Veneer Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.4.5": {
                "activity": "Manufactured Stone Veneer Installation on a Single-Story Building"
              },
              "23.4.8": {
                "activity": "Faux Stone Siding Installation on a 2-3 Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "22.7.5": {
                "activity": "Outdoor Pool Pump Replacement"
              }
            }
          },
          "23.4.7": {
            "activity": "Faux Stone Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.4.8": {
                "activity": "Faux Stone Siding Installation on a 2-3 Story Building"
              },
              "23.4.5": {
                "activity": "Manufactured Stone Veneer Installation on a Single-Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "20.7.6": {
                "activity": "Install Paver Landscape Edging"
              }
            }
          },
          "23.4.8": {
            "activity": "Faux Stone Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.4.7": {
                "activity": "Faux Stone Siding Installation on a Single-Story Building"
              },
              "23.4.6": {
                "activity": "Manufactured Stone Veneer Installation on a 2-3 Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "22.3.2": {
                "activity": "Seat Wall Installation"
              }
            }
          },
          "23.4.9": {
            "activity": "Stone Cladding Column Wrap",
            "recommendedActivities": {
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "23.4.5": {
                "activity": "Manufactured Stone Veneer Installation on a Single-Story Building"
              },
              "23.4.7": {
                "activity": "Faux Stone Siding Installation on a Single-Story Building"
              },
              "22.2.1": {
                "activity": "Outdoor Kitchen Cabinets Installation"
              },
              "22.7.1": {
                "activity": "Swimming Pool Site Preparation"
              }
            }
          },
          "23.4.10": {
            "activity": "Stone Cladding Protective Sealants Application",
            "recommendedActivities": {
              "23.4.9": {
                "activity": "Stone Cladding Column Wrap"
              },
              "23.4.6": {
                "activity": "Manufactured Stone Veneer Installation on a 2-3 Story Building"
              },
              "23.4.8": {
                "activity": "Faux Stone Siding Installation on a 2-3 Story Building"
              },
              "23.4.4": {
                "activity": "Natural Stone Installation on a 2-3 Story Building"
              },
              "22.4.4": {
                "activity": "Fireplace Cleaning"
              }
            }
          }
        }
      },
      "23.5": {
        "category": "Stucco",
        "activities": {
          "23.5.1": {
            "activity": "Traditional Stucco Application on a Single-Story Building",
            "recommendedActivities": {
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "11.4.2": {
                "activity": "Exterior Wood Stain Painting (Single-Story Building)"
              },
              "11.1.2": {
                "activity": "Deck Staining and Finishing"
              },
              "19.6.2": {
                "activity": "Routine Fa\u00e7ade Inspections"
              },
              "19.3.2": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              }
            }
          },
          "23.5.2": {
            "activity": "Traditional Stucco Application on a 2-3 Story Building",
            "recommendedActivities": {
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "11.7.2": {
                "activity": "Roof, Gutter, and Solar Panel Cleaning Combo"
              },
              "19.7.3": {
                "activity": "High-Rise Painting (Up to 60 Feet or Difficult-to-Reach Areas of the Facade)"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              }
            }
          },
          "23.5.3": {
            "activity": "Old Stucco Removal on a Single-Story Building",
            "recommendedActivities": {
              "23.2.4": {
                "activity": "Vinyl Siding Removal"
              },
              "23.1.3": {
                "activity": "Cedar Wood Shingle Siding Installation on a Single-Story Building"
              },
              "23.1.1": {
                "activity": "Wooden Clapboard Siding Installation on a Single-Story Building"
              },
              "20.13.1": {
                "activity": "Concrete & Masonry Waterproofing"
              },
              "20.12.5": {
                "activity": "Perimeter Bug Barrier Installation"
              }
            }
          },
          "23.5.4": {
            "activity": "Old Stucco Removal on a 2-3 Story Building",
            "recommendedActivities": {
              "23.3.1": {
                "activity": "Brick Veneer Removal"
              },
              "23.2.2": {
                "activity": "Composite Paneling Removal on a 2-3 Story Building"
              },
              "19.3.3": {
                "activity": "Masonry Painting (One Coat on a 2-3 Story Building)"
              },
              "11.6.2": {
                "activity": "Screening Replacement"
              },
              "11.4.3": {
                "activity": "Graffiti Removal"
              }
            }
          }
        }
      },
      "23.6": {
        "category": "Metal Cladding",
        "activities": {
          "23.6.1": {
            "activity": "Galvanized Steel Panel Installation",
            "recommendedActivities": {
              "23.6.2": {
                "activity": "Old Cladding Removal"
              },
              "23.4.2": {
                "activity": "Stone Cladding Surface Preparation"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              }
            }
          },
          "23.6.2": {
            "activity": "Old Cladding Removal",
            "recommendedActivities": {
              "23.6.1": {
                "activity": "Galvanized Steel Panel Installation"
              },
              "23.4.1": {
                "activity": "Old Cladding Removal"
              },
              "23.3.1": {
                "activity": "Thin Brick Veneer Removal"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "23.7": {
        "category": "Glass Facades",
        "activities": {
          "23.7.1": {
            "activity": "Glass Blocks Installation",
            "recommendedActivities": {
              "23.7.2": {
                "activity": "Glass Blocks Removal"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "23.5.1": {
                "activity": "Traditional Stucco Application on a Single-Story Building"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "23.7.2": {
            "activity": "Glass Blocks Removal",
            "recommendedActivities": {
              "23.7.1": {
                "activity": "Glass Blocks Installation"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "23.6.2": {
                "activity": "Old Cladding Removal"
              },
              "23.4.1": {
                "activity": "Old Cladding Removal"
              },
              "19.5.3": {
                "activity": "Bitumen Roof Removal"
              }
            }
          }
        }
      },
      "23.8": {
        "category": "Composite Paneling",
        "activities": {
          "23.8.1": {
            "activity": "Composite Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.8.5": {
                "activity": "Composite Paneling Removal on a Single-Story Building"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              }
            }
          },
          "23.8.2": {
            "activity": "Composite Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.8.6": {
                "activity": "Composite Paneling Removal on a 2-3 Story Building"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "20.10.3": {
                "activity": "Pavers Walkway and Path Installation"
              }
            }
          },
          "23.8.3": {
            "activity": "Fiber Cement Siding Installation on a Single Story Building",
            "recommendedActivities": {
              "23.8.5": {
                "activity": "Composite Paneling Removal on a Single-Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              }
            }
          },
          "23.8.4": {
            "activity": "Fiber Cement Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.8.6": {
                "activity": "Composite Paneling Removal on a 2-3 Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "20.6.3": {
                "activity": "Rock Wall Installation"
              }
            }
          },
          "23.8.5": {
            "activity": "Composite Paneling Removal on a Single-Story Building",
            "recommendedActivities": {
              "23.8.1": {
                "activity": "Composite Siding Installation on a Single-Story Building"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "23.6.2": {
                "activity": "Old Cladding Removal"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "22.4.5": {
                "activity": "Fireplace Removal"
              }
            }
          },
          "23.8.6": {
            "activity": "Composite Paneling Removal on a 2-3 Story Building",
            "recommendedActivities": {
              "23.8.2": {
                "activity": "Composite Siding Installation on a 2-3 Story Building"
              },
              "23.7.2": {
                "activity": "Glass Blocks Removal"
              },
              "23.4.1": {
                "activity": "Old Cladding Removal"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          }
        }
      },
      "23.9": {
        "category": "Trims and Moldings",
        "activities": {
          "23.9.1": {
            "activity": "Fiber Cement Trim Board Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.1": {
                "activity": "Composite Siding Installation on a Single-Story Building"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "23.9.2": {
            "activity": "Fiber Cement Trim Board Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.2": {
                "activity": "Composite Siding Installation on a 2-3 Story Building"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              }
            }
          },
          "23.9.3": {
            "activity": "Trim Engineered Treated Wood Siding Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.3": {
                "activity": "Fiber Cement Siding Installation on a Single Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "19.5.2": {
                "activity": "Self-Adhering Modified Bitumen Roof Installation"
              },
              "20.10.1": {
                "activity": "Natural Path Installation"
              }
            }
          },
          "23.9.4": {
            "activity": "Trim Engineered Treated Wood Siding Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.4": {
                "activity": "Fiber Cement Siding Installation on a 2-3 Story Building"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              }
            }
          },
          "23.9.5": {
            "activity": "PVC Trim Installation on a Single-Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.1": {
                "activity": "Composite Siding Installation on a Single-Story Building"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "11.4.1": {
                "activity": "Vinyl Siding Cleaning"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              }
            }
          },
          "23.9.6": {
            "activity": "PVC Trim Installation on a 2-3 Story Building",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.2": {
                "activity": "Composite Siding Installation on a 2-3 Story Building"
              },
              "19.3.3": {
                "activity": "Masonry Painting (Two Coats on a 2-3 Story Building)"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              }
            }
          },
          "23.9.7": {
            "activity": "Custom bent aluminum Installation",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.6.1": {
                "activity": "Galvanized Steel Panel Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          },
          "23.9.8": {
            "activity": "Texture Soffit Installation",
            "recommendedActivities": {
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "23.8.1": {
                "activity": "Composite Siding Installation on a Single-Story Building"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.10.3": {
                "activity": "Pavers Walkway and Path Installation"
              }
            }
          },
          "23.9.9": {
            "activity": "Trim and Molding Removal",
            "recommendedActivities": {
              "23.9.1": {
                "activity": "Fiber Cement Trim Board Installation on a Single-Story Building"
              },
              "23.8.5": {
                "activity": "Composite Paneling Removal on a Single-Story Building"
              },
              "23.6.2": {
                "activity": "Old Cladding Removal"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          }
        }
      },
      "23.10": {
        "category": "Underlayment",
        "activities": {
          "23.10.1": {
            "activity": "House Wrap Installation",
            "recommendedActivities": {
              "23.10.2": {
                "activity": "House Wrap Removal"
              },
              "23.8.1": {
                "activity": "Composite Siding Installation on a Single-Story Building"
              },
              "23.5.1": {
                "activity": "Traditional Stucco Application on a Single-Story Building"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              }
            }
          },
          "23.10.2": {
            "activity": "House Wrap Removal",
            "recommendedActivities": {
              "23.10.1": {
                "activity": "House Wrap Installation"
              },
              "23.8.5": {
                "activity": "Composite Paneling Removal on a Single-Story Building"
              },
              "23.6.2": {
                "activity": "Old Cladding Removal"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          }
        }
      },
      "23.11": {
        "category": "Pest Control",
        "activities": {
          "23.11.1": {
            "activity": "Perimeter Bug Barrier Installation",
            "recommendedActivities": {
              "23.11.2": {
                "activity": "Bird Spikes Installation"
              },
              "23.11.3": {
                "activity": "Screening Installation"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "22.7.6": {
                "activity": "Outdoor Pool Winterization"
              },
              "20.5.4": {
                "activity": "Mulch Replacement and Top-Up"
              }
            }
          },
          "23.11.2": {
            "activity": "Bird Spikes Installation",
            "recommendedActivities": {
              "23.11.1": {
                "activity": "Perimeter Bug Barrier Installation"
              },
              "23.11.3": {
                "activity": "Screening Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          },
          "23.11.3": {
            "activity": "Screening Installation",
            "recommendedActivities": {
              "23.11.4": {
                "activity": "Screening Replacement"
              },
              "23.11.1": {
                "activity": "Perimeter Bug Barrier Installation"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "20.13.5": {
                "activity": "Yard Drainage Solutions Installation"
              }
            }
          },
          "23.11.4": {
            "activity": "Screening Replacement",
            "recommendedActivities": {
              "23.11.3": {
                "activity": "Screening Installation"
              },
              "23.11.1": {
                "activity": "Perimeter Bug Barrier Installation"
              },
              "19.7.5": {
                "activity": "Gutter Removal"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          }
        }
      },
      "23.12": {
        "category": "Maintenance",
        "activities": {
          "23.12.1": {
            "activity": "Routine Fa\u00e7ade Inspections",
            "recommendedActivities": {
              "23.12.2": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          },
          "23.12.2": {
            "activity": "Fa\u00e7ade Structural Assessment",
            "recommendedActivities": {
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              },
              "19.6.4": {
                "activity": "Roof Damage Inspection"
              },
              "23.4.4": {
                "activity": "Natural Stone Installation on a 2-3 Story Building"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              }
            }
          },
          "23.12.3": {
            "activity": "Graffiti Removal",
            "recommendedActivities": {
              "23.12.4": {
                "activity": "Concrete & Masonry Waterproofing"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              },
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              }
            }
          },
          "23.12.4": {
            "activity": "Concrete & Masonry Waterproofing",
            "recommendedActivities": {
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              },
              "23.12.2": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "19.3.2": {
                "activity": "Masonry Painting (One Coat on a Single-Story Building)"
              },
              "23.9.9": {
                "activity": "Trim and Molding Removal"
              },
              "20.13.5": {
                "activity": "Yard Drainage Solutions Installation"
              }
            }
          },
          "23.12.5": {
            "activity": "Exterior Wood Fa\u00e7ade Waterproofing",
            "recommendedActivities": {
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              },
              "19.6.4": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "23.12.4": {
                "activity": "Concrete & Masonry Waterproofing"
              },
              "11.4.2": {
                "activity": "Wood Siding Cleaning"
              },
              "23.9.1": {
                "activity": "Fiber Cement Trim Board Installation on a Single-Story Building"
              }
            }
          },
          "23.12.6": {
            "activity": "Protection Fa\u00e7ade Against Moisture",
            "recommendedActivities": {
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              },
              "23.12.4": {
                "activity": "Concrete & Masonry Waterproofing"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "23.4.10": {
                "activity": "Stone Cladding Protective Sealants Application"
              },
              "11.4.3": {
                "activity": "Brick and Stone Cleaning"
              }
            }
          }
        }
      }
    }
  },
  "24": {
    "section": "Outdoor Security",
    "categories": {
      "24.1": {
        "category": "CCTV",
        "activities": {
          "24.1.1": {
            "activity": "4 WiFi Security Camera System with Monitor Installation",
            "recommendedActivities": {
              "24.1.2": {
                "activity": "8 WiFi Security Camera System with Monitor Installation"
              },
              "24.2.3": {
                "activity": "Gutter Mount Security Camera and Solar Panel Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              }
            }
          },
          "24.1.2": {
            "activity": "8 WiFi Security Camera System with Monitor Installation",
            "recommendedActivities": {
              "24.1.3": {
                "activity": "16 Security Camera System with Human & Vehicle Detection Installation"
              },
              "24.2.1": {
                "activity": "Battery-powered Wireless Smart Home Security Camera Installation"
              },
              "19.6.4": {
                "activity": "Roof Damage Inspection"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              },
              "20.13.1": {
                "activity": "French Drain System Installation"
              }
            }
          },
          "24.1.3": {
            "activity": "16 Security Camera System with Human & Vehicle Detection Installation",
            "recommendedActivities": {
              "24.1.1": {
                "activity": "4 WiFi Security Camera System with Monitor Installation"
              },
              "24.2.4": {
                "activity": "Maintenance (battery replacement, cleaning)"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "23.12.2": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "24.2": {
        "category": "Wireless Cameras",
        "activities": {
          "24.2.1": {
            "activity": "Battery-powered Wireless Smart Home Security Camera Installation",
            "recommendedActivities": {
              "24.2.2": {
                "activity": "Small Solar Panel for Outdoor Cameras Installation"
              },
              "24.2.4": {
                "activity": "Maintenance (battery replacement, cleaning)"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "23.12.3": {
                "activity": "Graffiti Removal"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              }
            }
          },
          "24.2.2": {
            "activity": "Small Solar Panel for Outdoor Cameras Installation",
            "recommendedActivities": {
              "24.2.1": {
                "activity": "Battery-powered Wireless Smart Home Security Camera Installation"
              },
              "24.2.3": {
                "activity": "Gutter Mount Security Camera and Solar Panel Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              }
            }
          },
          "24.2.3": {
            "activity": "Gutter Mount Security Camera and Solar Panel Installation",
            "recommendedActivities": {
              "24.2.2": {
                "activity": "Small Solar Panel for Outdoor Cameras Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              }
            }
          },
          "24.2.4": {
            "activity": "Maintenance (battery replacement, cleaning)",
            "recommendedActivities": {
              "24.2.1": {
                "activity": "Battery-powered Wireless Smart Home Security Camera Installation"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "19.6.4": {
                "activity": "Roof Damage Inspection"
              },
              "23.12.2": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "23.12.6": {
                "activity": "Protection Fa\u00e7ade Against Moisture"
              }
            }
          }
        }
      },
      "24.3": {
        "category": "Security Alarms",
        "activities": {
          "24.3.1": {
            "activity": "Motion-Sensing Security Alarm Installation",
            "recommendedActivities": {
              "24.3.2": {
                "activity": "Door/Window Alarm Installation"
              },
              "24.1.1": {
                "activity": "4 WiFi Security Camera System with Monitor Installation"
              },
              "24.4.1": {
                "activity": "Video Doorbell Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              }
            }
          },
          "24.3.2": {
            "activity": "Door/Window Alarm Installation",
            "recommendedActivities": {
              "24.3.1": {
                "activity": "Motion-Sensing Security Alarm Installation"
              },
              "24.4.1": {
                "activity": "Video Doorbell Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "24.2.4": {
                "activity": "Maintenance (battery replacement, cleaning)"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              }
            }
          },
          "24.3.3": {
            "activity": "Wireless Security System, 14 Piece Installation",
            "recommendedActivities": {
              "24.3.1": {
                "activity": "Motion-Sensing Security Alarm Installation"
              },
              "24.1.3": {
                "activity": "16 Security Camera System with Human & Vehicle Detection Installation"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              },
              "23.12.2": {
                "activity": "Fa\u00e7ade Structural Assessment"
              },
              "20.10.7": {
                "activity": "Surface Maintenance and Weed Control"
              }
            }
          }
        }
      },
      "24.4": {
        "category": "Doorbell Cameras",
        "activities": {
          "24.4.1": {
            "activity": "Video Doorbell Installation",
            "recommendedActivities": {
              "24.4.2": {
                "activity": "Maintenance and Battery Pack Replacement"
              },
              "24.3.1": {
                "activity": "Motion-Sensing Security Alarm Installation"
              },
              "24.2.1": {
                "activity": "Battery-powered Wireless Smart Home Security Camera Installation"
              },
              "19.7.4": {
                "activity": "Gutter Repair"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              }
            }
          },
          "24.4.2": {
            "activity": "Maintenance and Battery Pack Replacement",
            "recommendedActivities": {
              "24.4.1": {
                "activity": "Video Doorbell Installation"
              },
              "24.2.4": {
                "activity": "Maintenance (battery replacement, cleaning)"
              },
              "19.6.4": {
                "activity": "Roof Damage Inspection"
              },
              "20.13.6": {
                "activity": "Drainage System Cleaning"
              },
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              }
            }
          }
        }
      },
      "24.5": {
        "category": "Biometric Access",
        "activities": {
          "24.5.1": {
            "activity": "Fingerprint WiFi Smart Lock Installation",
            "recommendedActivities": {
              "24.5.2": {
                "activity": "Over Existing Deadbolt Smart Lock Installation"
              },
              "24.3.1": {
                "activity": "Motion-Sensing Security Alarm Installation"
              },
              "24.4.1": {
                "activity": "Video Doorbell Installation"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              },
              "19.7.2": {
                "activity": "Drip Edge and Gutter Installation for Single-Story Houses"
              }
            }
          },
          "24.5.2": {
            "activity": "Over Existing Deadbolt Smart Lock Installation",
            "recommendedActivities": {
              "24.5.1": {
                "activity": "Fingerprint WiFi Smart Lock Installation"
              },
              "24.6.1": {
                "activity": "Smart Door Lock with Bluetooth and Pushbutton Keypad Installation"
              },
              "24.4.2": {
                "activity": "Maintenance and Battery Pack Replacement"
              },
              "23.12.1": {
                "activity": "Routine Fa\u00e7ade Inspections"
              },
              "20.13.2": {
                "activity": "Downspout Runoff Installation"
              }
            }
          }
        }
      },
      "24.6": {
        "category": "Keypad Access",
        "activities": {
          "24.6.1": {
            "activity": "Smart Door Lock with Bluetooth and Pushbutton Keypad Installation",
            "recommendedActivities": {
              "24.5.1": {
                "activity": "Fingerprint WiFi Smart Lock Installation"
              },
              "24.3.2": {
                "activity": "Door/Window Alarm Installation"
              },
              "24.4.1": {
                "activity": "Video Doorbell Installation"
              },
              "19.6.2": {
                "activity": "Comprehensive Roof Inspection"
              },
              "23.12.5": {
                "activity": "Exterior Wood Fa\u00e7ade Waterproofing"
              }
            }
          }
        }
      }
    }
  }
};