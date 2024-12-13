export type EmergencyService = {
    tools: string[];
    steps: {
        step_number: number;
        title: string;
        description: string;
    }[];
    activities: Record<string, { activity: string; unit_of_measurement: string }>;
};

export type EmergencyServicesType = Record<
    string,
    {
        services: Record<string, EmergencyService>;
    }
>;

export const EMERGENCY_SERVICES: EmergencyServicesType = {
  Plumbing: {
    services: {
      burstPipesRepair: {
        tools: [
          "Pipe cutter",
          "Pipe wrench",
          "Bucket",
          "Towels",
          "Plumber's tape",
          "Pliers",
          "Safety goggles",
          "Work gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Turn Off Main Water Supply",
            description:
              "Quickly turn off the main water supply to your home. This valve is usually located near the water meter or where the main water line enters your house.",
          },
          {
            step_number: 2,
            title: "Drain the Faucets",
            description:
              "After the water is off, open all faucets connected to the burst pipe to drain the remaining water. Don't forget to flush toilets to clear the water from the system.",
          },
          {
            step_number: 3,
            title: "Turn Off Electrical Appliances",
            description:
              "If water from the burst pipe is near any electrical appliances or outlets, switch off the power at the breaker box to avoid electrical hazards.",
          },
          {
            step_number: 4,
            title: "Collect the Water",
            description:
              "Use buckets, pots, or any large containers to collect dripping water. Lay towels around the affected area to absorb spills and minimize water damage.",
          },
          {
            step_number: 5,
            title: "Document the Damage",
            description:
              "After the water is off, take photos of the burst pipe and any damage it has caused for insurance or repair records.",
          },
          {
            step_number: 6,
            title: "Stay Calm and Safe",
            description:
              "Try to stay calm. Avoid using any electrical devices or appliances until the problem has been resolved and the area is declared safe.",
          },
          {
            step_number: 7,
            title: "Wait for Help",
            description:
              "A plumbing specialist is on the way and will handle the repair. These steps have mitigated the damage and made the area safer for the specialist to work efficiently upon arrival.",
          },
        ],
        activities: {
          "2-9-3": {
            activity: "3/4 inch Pipe Emergency Repair",
            unit_of_measurement: "each",
          },
          "2-9-4": {
            activity: "1/2 inch Pipe Emergency Repair",
            unit_of_measurement: "each",
          },
          "2-1-3": {
            activity: "Tank Flapper Replacement",
            unit_of_measurement: "each",
          },
          "2-1-4": {
            activity: "Flush Mechanism Repair",
            unit_of_measurement: "each",
          },
        },
      },
      emergencyLeakFixes: {
        tools: [
          "Pipe cutter",
          "Pipe wrench",
          "Bucket",
          "Towels",
          "Plumber's tape",
          "Pliers",
          "Safety goggles",
          "Work gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Leak",
            description:
              "Locate the source of the leak by carefully inspecting the area. Identify whether the leak is from a pipe, fixture, or appliance.",
          },
          {
            step_number: 2,
            title: "Turn Off Water Supply",
            description:
              "Quickly turn off the water supply to the affected area to prevent further damage. Use the nearest shut-off valve or the main water valve.",
          },
          {
            step_number: 3,
            title: "Drain the Affected Area",
            description:
              "Drain any standing water from the area by opening faucets and using towels or buckets to remove excess water.",
          },
          {
            step_number: 4,
            title: "Temporary Fix",
            description:
              "Apply a temporary fix, such as using plumber's tape or pipe clamps, to minimize the leak until a permanent solution can be implemented.",
          },
          {
            step_number: 5,
            title: "Check for Electrical Hazards",
            description:
              "If the leak is near electrical outlets or appliances, turn off the power supply to avoid electrical hazards.",
          },
          {
            step_number: 6,
            title: "Document the Damage",
            description:
              "Take photos of the leak and any resulting damage for insurance purposes and to assist the plumber in assessing the situation.",
          },
          {
            step_number: 7,
            title: "Wait for Professional Help",
            description:
              "A professional plumber is on the way to perform a permanent fix. Meanwhile, monitor the area and ensure no further damage occurs.",
          },
        ],
        activities: {
          "2-8-1": {
            activity: "Drain Line Camera Inspection",
            unit_of_measurement: "each",
          },
          "2-8-2": {
            activity: "Clog Clearing",
            unit_of_measurement: "each",
          },
          "2-9-3": {
            activity: "3/4 inch Pipe Emergency Repair",
            unit_of_measurement: "each",
          },
          "2-9-4": {
            activity: "1/2 inch Pipe Emergency Repair",
            unit_of_measurement: "each",
          },
        },
      },
      cloggedOrOverflowingToilets: {
        tools: [
          "Plunger",
          "Toilet auger",
          "Bucket",
          "Towels",
          "Rubber gloves",
          "Safety goggles",
          "Drain snake",
        ],
        steps: [
          {
            step_number: 1,
            title: "Stop Water Flow",
            description:
              "Quickly remove the toilet tank lid and push down the flapper to stop water from entering the bowl. If the water is overflowing, shut off the water supply valve located near the toilet.",
          },
          {
            step_number: 2,
            title: "Assess the Situation",
            description:
              "Determine if the clog is in the toilet bowl or further down the drain. This will help decide which tool to use.",
          },
          {
            step_number: 3,
            title: "Plunge the Toilet",
            description:
              "Use a plunger to try to dislodge the clog. Ensure a tight seal and push down firmly multiple times.",
          },
          {
            step_number: 4,
            title: "Use a Toilet Auger",
            description:
              "If plunging doesn't work, use a toilet auger to break up the clog. Insert the auger into the toilet bowl and turn the handle clockwise.",
          },
          {
            step_number: 5,
            title: "Clean Up",
            description:
              "After clearing the clog, clean up any water or debris with towels. Sanitize the area with appropriate cleaning solutions.",
          },
          {
            step_number: 6,
            title: "Document the Issue",
            description:
              "Take note of any recurring clogs or unusual behavior with the toilet for further inspection.",
          },
          {
            step_number: 7,
            title: "Wait for Help",
            description:
              "If the issue persists, a professional plumber is on the way to provide a permanent solution.",
          },
        ],
        activities: {
          "2-1-3": {
            activity: "Tank Flapper Replacement",
            unit_of_measurement: "each",
          },
          "2-1-4": {
            activity: "Flush Mechanism Repair",
            unit_of_measurement: "each",
          },
          "2-8-2": {
            activity: "Clog Clearing",
            unit_of_measurement: "each",
          },
          "2-8-1": {
            activity: "Drain Line Camera Inspection",
            unit_of_measurement: "each",
          },
        },
      },
      sewerSystemBackups: {
        tools: [
          "Plunger",
          "Drain snake",
          "Bucket",
          "Towels",
          "Rubber gloves",
          "Safety goggles",
          "Sewer inspection camera",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Blockage",
            description:
              "Locate the source of the backup by checking toilets, drains, and cleanouts. Use a sewer inspection camera if available.",
          },
          {
            step_number: 2,
            title: "Stop Water Usage",
            description:
              "Immediately stop using water fixtures to prevent further backups. Communicate with all household members to ensure no water is used.",
          },
          {
            step_number: 3,
            title: "Attempt to Clear the Blockage",
            description:
              "Use a plunger or drain snake to attempt to clear the blockage in the accessible drains. If the blockage is deeper, a professional tool may be required.",
          },
          {
            step_number: 4,
            title: "Clean Up",
            description:
              "Once the blockage is cleared, clean up any sewage or water spills using towels and disinfectants.",
          },
          {
            step_number: 5,
            title: "Document the Issue",
            description:
              "Take photos of the affected areas and any visible damage for insurance and repair records.",
          },
          {
            step_number: 6,
            title: "Wait for Professional Assistance",
            description:
              "If the blockage cannot be cleared, wait for a professional plumber to arrive and assess the situation.",
          },
        ],
        activities: {
          "2-8-1": {
            activity: "Drain Line Camera Inspection",
            unit_of_measurement: "each",
          },
          "2-8-2": {
            activity: "Clog Clearing",
            unit_of_measurement: "each",
          },
          "20-13-6": {
            activity: "Drainage System Cleaning",
            unit_of_measurement: "each",
          },
        },
      },
      noHotWaterSituations: {
        tools: [
          "Multimeter",
          "Pipe wrench",
          "Bucket",
          "Towels",
          "Rubber gloves",
          "Safety goggles",
          "Thermometer",
        ],
        steps: [
          {
            step_number: 1,
            title: "Check the Water Heater",
            description:
              "Inspect the water heater for any visible issues, such as leaks or unusual noises. Ensure the unit is receiving power or gas.",
          },
          {
            step_number: 2,
            title: "Reset the Water Heater",
            description:
              "If your water heater has a reset button, try resetting the unit. This might restore the hot water supply.",
          },
          {
            step_number: 3,
            title: "Test the Thermostat",
            description:
              "Use a thermometer to check if the thermostat is set to the correct temperature. Adjust if necessary.",
          },
          {
            step_number: 4,
            title: "Inspect the Heating Elements",
            description:
              "For electric water heaters, test the heating elements with a multimeter to ensure they are functioning correctly.",
          },
          {
            step_number: 5,
            title: "Check for Gas Supply",
            description:
              "If you have a gas water heater, ensure that the gas supply is turned on and that the pilot light is lit.",
          },
          {
            step_number: 6,
            title: "Document the Issue",
            description:
              "Take note of any findings and document the steps you have taken so far.",
          },
          {
            step_number: 7,
            title: "Wait for Professional Assistance",
            description:
              "If the problem persists, a professional plumber is on the way to diagnose and resolve the issue.",
          },
        ],
        activities: {
          "2-6-1": {
            activity: "Gas Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-2": {
            activity: "Electric Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-3": {
            activity: "Old Water Heater Removal",
            unit_of_measurement: "each",
          },
          "2-6-4": {
            activity: "Electric Tankless Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-5": {
            activity: "Water Heater Thermostat Replacement",
            unit_of_measurement: "each",
          },
          "2-6-6": {
            activity: "Water Heater Element Replacement",
            unit_of_measurement: "each",
          },
        },
      },
      brokenWaterHeaters: {
        tools: [
          "Multimeter",
          "Pipe wrench",
          "Bucket",
          "Towels",
          "Rubber gloves",
          "Safety goggles",
          "Thermometer",
          "Plumber's tape",
        ],
        steps: [
          {
            step_number: 1,
            title: "Inspect the Water Heater",
            description:
              "Visually inspect the water heater for signs of damage, leaks, or corrosion. Ensure that the unit is receiving power or gas.",
          },
          {
            step_number: 2,
            title: "Turn Off Power/Gas",
            description:
              "If the water heater is damaged, turn off the power or gas supply to prevent further damage or hazards.",
          },
          {
            step_number: 3,
            title: "Drain the Water Heater",
            description:
              "Use a hose to drain the water from the tank into a bucket or nearby drain. This step is essential before any repairs or replacements.",
          },
          {
            step_number: 4,
            title: "Test Heating Elements",
            description:
              "For electric water heaters, use a multimeter to test the heating elements and thermostat. Replace if necessary.",
          },
          {
            step_number: 5,
            title: "Inspect the Gas Supply",
            description:
              "For gas water heaters, check that the pilot light is functioning and that there are no issues with the gas supply.",
          },
          {
            step_number: 6,
            title: "Document the Damage",
            description:
              "Take photos and notes of the damaged parts for future reference or insurance claims.",
          },
          {
            step_number: 7,
            title: "Repair or Replace Components",
            description:
              "Replace any faulty components such as the heating element, thermostat, or gas valve. Ensure everything is securely installed.",
          },
          {
            step_number: 8,
            title: "Refill and Test",
            description:
              "Refill the water heater and test the unit to ensure it is functioning correctly and there are no leaks.",
          },
        ],
        activities: {
          "2-6-1": {
            activity: "Gas Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-2": {
            activity: "Electric Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-3": {
            activity: "Old Water Heater Removal",
            unit_of_measurement: "each",
          },
          "2-6-4": {
            activity: "Electric Tankless Water Heater Installation",
            unit_of_measurement: "each",
          },
          "2-6-5": {
            activity: "Water Heater Thermostat Replacement",
            unit_of_measurement: "each",
          },
          "2-6-6": {
            activity: "Water Heater Element Replacement",
            unit_of_measurement: "each",
          },
          "2-6-7": {
            activity: "Gas Valve Replacement",
            unit_of_measurement: "each",
          },
        },
      },
      majorDrainBlockages: {
        tools: [
          "Plunger",
          "Drain snake",
          "Bucket",
          "Towels",
          "Rubber gloves",
          "Safety goggles",
          "Sewer inspection camera",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Blockage",
            description:
              "Locate the source of the blockage by checking toilets, drains, and cleanouts. Use a sewer inspection camera if available.",
          },
          {
            step_number: 2,
            title: "Stop Water Usage",
            description:
              "Immediately stop using water fixtures to prevent further backups. Communicate with all household members to ensure no water is used.",
          },
          {
            step_number: 3,
            title: "Attempt to Clear the Blockage",
            description:
              "Use a plunger or drain snake to attempt to clear the blockage in the accessible drains. If the blockage is deeper, a professional tool may be required.",
          },
          {
            step_number: 4,
            title: "Clean Up",
            description:
              "Once the blockage is cleared, clean up any sewage or water spills using towels and disinfectants.",
          },
          {
            step_number: 5,
            title: "Document the Issue",
            description:
              "Take photos of the affected areas and any visible damage for insurance and repair records.",
          },
          {
            step_number: 6,
            title: "Wait for Professional Assistance",
            description:
              "If the blockage cannot be cleared, wait for a professional plumber to arrive and assess the situation.",
          },
        ],
        activities: {
          "2-8-1": {
            activity: "Drain Line Camera Inspection",
            unit_of_measurement: "each",
          },
          "2-8-2": {
            activity: "Clog Clearing",
            unit_of_measurement: "each",
          },
          "20-13-6": {
            activity: "Drainage System Cleaning",
            unit_of_measurement: "each",
          },
          "20-13-3": {
            activity: "Landscape Drainage Solutions Installation",
            unit_of_measurement: "each",
          },
        },
      },
    },
  },
  Electricity: {
    services: {
      powerOutagesAndElectricalFailures: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Insulated screwdrivers",
          "Flashlight",
          "Rubber gloves",
          "Safety goggles",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Issue",
            description:
              "Determine whether the outage is affecting the entire house or just specific areas. Check the main electrical panel and circuit breakers for tripped switches.",
          },
          {
            step_number: 2,
            title: "Check for External Causes",
            description:
              "Verify if the power outage is due to external factors such as downed power lines or utility company issues. If so, contact the utility provider.",
          },
          {
            step_number: 3,
            title: "Test Electrical Components",
            description:
              "Use a multimeter and voltage tester to check for electrical continuity and voltage at various outlets and switches to pinpoint the failure.",
          },
          {
            step_number: 4,
            title: "Reset Circuit Breakers",
            description:
              "If a breaker is tripped, reset it and monitor the circuit. If the breaker trips again, leave it off and wait for a professional electrician.",
          },
          {
            step_number: 5,
            title: "Inspect Wiring",
            description:
              "Inspect visible wiring for signs of damage or overheating. Do not attempt repairs if damage is found; instead, turn off power and wait for an electrician.",
          },
          {
            step_number: 6,
            title: "Document the Issue",
            description:
              "Take notes and photos of any findings and document steps taken. This will be helpful for the electrician to understand the situation.",
          },
          {
            step_number: 7,
            title: "Wait for Professional Assistance",
            description:
              "If the problem cannot be resolved, a professional electrician is on the way to diagnose and fix the issue.",
          },
        ],
        activities: {
          "10-1-2": {
            activity: "Circuit Breaker Replacement",
            unit_of_measurement: "each",
          },
          "10-1-5": {
            activity: "Outdoor Electrical Panel Safety Inspection",
            unit_of_measurement: "each",
          },
          "1-9-1": {
            activity: "Circuit Breaker and Fuse Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "10-10-2": {
            activity: "Outdoor Electrical Troubleshooting and Emergency Repairs",
            unit_of_measurement: "each",
          },
        },
      },
      shortCircuitsAndSparkingWires: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Insulated screwdrivers",
          "Wire strippers",
          "Electrical tape",
          "Safety goggles",
          "Rubber gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Turn Off Power",
            description:
              "Immediately turn off the power to the affected circuit by switching off the corresponding circuit breaker or removing the fuse.",
          },
          {
            step_number: 2,
            title: "Inspect the Affected Area",
            description:
              "Visually inspect the outlet, switch, or fixture for signs of damage, such as blackened marks, melting, or frayed wires.",
          },
          {
            step_number: 3,
            title: "Test for Voltage",
            description:
              "Use a voltage tester to confirm that the circuit is de-energized before proceeding with any repairs.",
          },
          {
            step_number: 4,
            title: "Identify the Cause",
            description:
              "Carefully examine the wiring and connections to identify the cause of the short circuit or sparking. Common issues include loose connections, damaged insulation, or overloaded circuits.",
          },
          {
            step_number: 5,
            title: "Repair or Replace Damaged Components",
            description:
              "Repair or replace any damaged wires, connectors, or devices. Use proper techniques and materials to ensure a safe and reliable repair.",
          },
          {
            step_number: 6,
            title: "Insulate and Secure Wiring",
            description:
              "After repairs, insulate any exposed wires with electrical tape or heat shrink tubing, and secure the wiring properly to prevent future issues.",
          },
          {
            step_number: 7,
            title: "Test the Circuit",
            description:
              "Once repairs are complete, restore power and test the circuit to ensure it is functioning correctly without any signs of sparking or overheating.",
          },
          {
            step_number: 8,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair work for future reference and provide a summary of the issue and solution.",
          },
        ],
        activities: {
          "1-8-1": {
            activity: "Wiring with PVC Conduit Installation",
            unit_of_measurement: "sq ft",
          },
          "1-8-2": {
            activity: "Wiring Installation (no conduits)",
            unit_of_measurement: "sq ft",
          },
          "1-9-1": {
            activity: "Circuit Breaker and Fuse Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "1-9-2": {
            activity: "Faulty Wiring and Connection Troubleshooting",
            unit_of_measurement: "sq ft",
          },
        },
      },
      overloadedCircuits: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Insulated screwdrivers",
          "Circuit analyzer",
          "Safety goggles",
          "Rubber gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Turn Off Power",
            description:
              "Immediately turn off the power to the affected circuit by switching off the corresponding circuit breaker to prevent further damage or hazards.",
          },
          {
            step_number: 2,
            title: "Identify the Affected Circuit",
            description:
              "Check the main electrical panel to identify which circuit is overloaded. This may involve checking the labels or testing each circuit.",
          },
          {
            step_number: 3,
            title: "Inspect for Overloads",
            description:
              "Use a circuit analyzer or voltage tester to inspect the circuit for signs of overload, such as overheating wires, tripped breakers, or scorched outlets.",
          },
          {
            step_number: 4,
            title: "Disconnect High-Power Devices",
            description:
              "Unplug or turn off high-power appliances or devices that may be causing the overload. Spread out the load across multiple circuits if possible.",
          },
          {
            step_number: 5,
            title: "Repair or Upgrade Wiring",
            description:
              "If the circuit cannot handle the load, consider upgrading the wiring or installing additional circuits. Ensure that any repairs meet local electrical codes.",
          },
          {
            step_number: 6,
            title: "Reset the Circuit Breaker",
            description:
              "Once the issue is resolved, reset the circuit breaker and monitor the circuit for any further signs of overload or failure.",
          },
          {
            step_number: 7,
            title: "Document the Issue",
            description:
              "Take notes and photos of any findings and document steps taken. This will be helpful for future reference or for the electrician to understand the situation.",
          },
          {
            step_number: 8,
            title: "Wait for Professional Assistance",
            description:
              "If the problem cannot be resolved or if extensive repairs are needed, wait for a professional electrician to assess and fix the issue.",
          },
        ],
        activities: {
          "1-9-1": {
            activity: "Circuit Breaker and Fuse Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "1-9-2": {
            activity: "Faulty Wiring and Connection Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "10-1-2": {
            activity: "Circuit Breaker Replacement",
            unit_of_measurement: "each",
          },
          "10-1-5": {
            activity: "Outdoor Electrical Panel Safety Inspection",
            unit_of_measurement: "each",
          },
        },
      },
      emergencyGeneratorInstallation: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Insulated screwdrivers",
          "Wrench set",
          "Wire strippers",
          "Safety goggles",
          "Rubber gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Select Generator Location",
            description:
              "Choose a location for the generator that is safe, well-ventilated, and compliant with local codes. Ensure the area is clear of any obstructions.",
          },
          {
            step_number: 2,
            title: "Install the Transfer Switch",
            description:
              "Install the transfer switch near the main electrical panel. This switch will allow the generator to supply power to the house when the main power is out.",
          },
          {
            step_number: 3,
            title: "Connect the Generator",
            description:
              "Connect the generator to the transfer switch using the appropriate wiring. Ensure all connections are secure and properly insulated.",
          },
          {
            step_number: 4,
            title: "Test the System",
            description:
              "Test the generator and transfer switch to ensure everything is functioning correctly. Check for proper voltage output and make sure the generator powers the necessary circuits.",
          },
          {
            step_number: 5,
            title: "Final Inspection",
            description:
              "Inspect the entire installation for any potential safety issues. Ensure all wiring is properly secured and that the generator is functioning as intended.",
          },
          {
            step_number: 6,
            title: "Document the Installation",
            description:
              "Take photos and notes of the installation process. Provide a summary of the setup, including any specific instructions for operating the generator.",
          },
        ],
        activities: {
          "10-7-1": {
            activity: "Whole House Propane/Natural Gas Generator Installation",
            unit_of_measurement: "each",
          },
          "10-7-2": {
            activity: "Whole House Generator Maintenance",
            unit_of_measurement: "each",
          },
          "10-1-1": {
            activity: "Outdoor Electrical Panel Installation",
            unit_of_measurement: "each",
          },
          "10-10-2": {
            activity: "Outdoor Electrical Troubleshooting and Emergency Repairs",
            unit_of_measurement: "each",
          },
        },
      },
      hazardousElectricalSituationResolution: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Insulated screwdrivers",
          "Wire strippers",
          "Rubber gloves",
          "Safety goggles",
          "Non-contact voltage detector",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Hazard",
            description:
              "Assess the situation to determine the nature of the electrical hazard, such as exposed wires, sparking, or signs of overheating. Keep a safe distance until power is confirmed off.",
          },
          {
            step_number: 2,
            title: "Turn Off Power",
            description:
              "Immediately turn off power to the affected area by switching off the circuit breaker or removing the fuse associated with the hazard.",
          },
          {
            step_number: 3,
            title: "Test for Voltage",
            description:
              "Use a non-contact voltage detector to confirm that the circuit is de-energized before approaching or touching any components.",
          },
          {
            step_number: 4,
            title: "Secure the Area",
            description:
              "Ensure that the area is secured to prevent others from accidentally coming into contact with the hazard. Post warning signs if necessary.",
          },
          {
            step_number: 5,
            title: "Repair or Isolate the Hazard",
            description:
              "If possible, repair the issue by replacing damaged components, tightening loose connections, or insulating exposed wires. If the hazard cannot be immediately repaired, isolate the area until a professional can address it.",
          },
          {
            step_number: 6,
            title: "Inspect and Test",
            description:
              "After repairs, inspect the entire area for additional hazards and test the electrical system to ensure that it is functioning safely.",
          },
          {
            step_number: 7,
            title: "Document the Situation",
            description:
              "Take notes and photos of the hazard, the repairs made, and the current condition of the area. Provide a summary for future reference or insurance purposes.",
          },
          {
            step_number: 8,
            title: "Wait for Professional Assistance",
            description:
              "If the situation requires more extensive repairs, wait for a professional electrician to arrive and resolve the issue completely.",
          },
        ],
        activities: {
          "1-9-1": {
            activity: "Circuit Breaker and Fuse Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "1-9-2": {
            activity: "Faulty Wiring and Connection Troubleshooting",
            unit_of_measurement: "sq ft",
          },
          "10-1-5": {
            activity: "Outdoor Electrical Panel Safety Inspection",
            unit_of_measurement: "each",
          },
          "10-10-2": {
            activity: "Outdoor Electrical Troubleshooting and Emergency Repairs",
            unit_of_measurement: "each",
          },
        },
      },
    },
  },
  Roofing: {
    services: {
      leakRepairsFromStormDamage: {
        tools: [
          "Ladder",
          "Roofing hammer",
          "Utility knife",
          "Roofing nails",
          "Roofing cement",
          "Pry bar",
          "Safety harness",
          "Roofing tape",
          "Tarp",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Carefully inspect the roof to determine the extent of the damage. Identify areas where leaks have occurred and check for any missing or damaged shingles.",
          },
          {
            step_number: 2,
            title: "Temporary Leak Control",
            description:
              "Apply a tarp or roofing tape to the affected areas to temporarily stop the leak until permanent repairs can be made. Ensure the tarp is securely fastened to prevent it from being blown away by wind.",
          },
          {
            step_number: 3,
            title: "Remove Damaged Materials",
            description:
              "Carefully remove any damaged shingles, flashing, or other roofing materials that need to be replaced. Use a pry bar and utility knife to safely detach these materials.",
          },
          {
            step_number: 4,
            title: "Repair and Replace",
            description:
              "Install new shingles or flashing where necessary, ensuring that they are properly aligned and secured with roofing nails. Apply roofing cement around the edges to seal and protect the area.",
          },
          {
            step_number: 5,
            title: "Inspect the Repair",
            description:
              "Once repairs are complete, inspect the area to ensure the leak has been fully addressed. Check that all materials are secure and that no gaps are present.",
          },
          {
            step_number: 6,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair work for future reference and to assist with any insurance claims.",
          },
        ],
        activities: {
          "19-1-2": {
            activity: "Flashing Repair",
            unit_of_measurement: "each",
          },
          "19-1-3": {
            activity: "Temporary Leak Repairs",
            unit_of_measurement: "each",
          },
          "19-1-4": {
            activity: "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)",
            unit_of_measurement: "each",
          },
          "19-6-3": {
            activity: "Roof Damage Inspection",
            unit_of_measurement: "each",
          },
        },
      },
      emergencyPatchingForHoles: {
        tools: [
          "Ladder",
          "Roofing hammer",
          "Utility knife",
          "Roofing nails",
          "Roofing cement",
          "Pry bar",
          "Safety harness",
          "Tarp",
          "Plywood",
          "Roofing tape",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Carefully inspect the roof to determine the extent of the hole and the damage surrounding it. Identify any potential safety hazards before starting the patching.",
          },
          {
            step_number: 2,
            title: "Prepare the Area",
            description:
              "Clear the area around the hole of any debris, loose shingles, or other materials that could interfere with the patching process.",
          },
          {
            step_number: 3,
            title: "Apply a Temporary Patch",
            description:
              "Cover the hole with a piece of plywood or roofing tape to prevent further water ingress. Secure the temporary patch with roofing nails or adhesive, depending on the material used.",
          },
          {
            step_number: 4,
            title: "Seal the Edges",
            description:
              "Apply roofing cement around the edges of the patch to create a watertight seal. Ensure the cement is spread evenly to prevent any gaps.",
          },
          {
            step_number: 5,
            title: "Inspect and Secure",
            description:
              "Once the patch is in place, inspect it to ensure it is secure and properly sealed. Make any necessary adjustments before leaving the site.",
          },
          {
            step_number: 6,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair work for future reference and to assist with any insurance claims.",
          },
        ],
        activities: {
          "19-1-2": {
            activity: "Flashing Repair",
            unit_of_measurement: "each",
          },
          "19-1-3": {
            activity: "Temporary Leak Repairs",
            unit_of_measurement: "each",
          },
          "19-1-4": {
            activity: "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)",
            unit_of_measurement: "each",
          },
          "19-6-3": {
            activity: "Roof Damage Inspection",
            unit_of_measurement: "each",
          },
        },
      },
      structuralDamageStabilization: {
        tools: [
          "Ladder",
          "Pry bar",
          "Hammer",
          "Screws and nails",
          "Safety harness",
          "Level",
          "Support beams",
          "Wooden planks",
          "Tarp",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Carefully inspect the roof and supporting structures to determine the extent of the damage. Identify areas that require immediate stabilization.",
          },
          {
            step_number: 2,
            title: "Clear the Area",
            description:
              "Remove any debris or loose materials that could pose a hazard during the stabilization process. Ensure the area is safe for workers.",
          },
          {
            step_number: 3,
            title: "Install Temporary Supports",
            description:
              "Use support beams and wooden planks to temporarily brace the damaged areas. Ensure that the supports are level and securely anchored.",
          },
          {
            step_number: 4,
            title: "Reinforce Damaged Sections",
            description:
              "Reinforce the damaged sections with additional wood or metal bracing as needed. Use screws and nails to secure the braces in place.",
          },
          {
            step_number: 5,
            title: "Cover Exposed Areas",
            description:
              "Use a tarp to cover any exposed areas of the roof or structure to prevent further damage from weather until permanent repairs can be made.",
          },
          {
            step_number: 6,
            title: "Inspect the Stabilization",
            description:
              "Once the stabilization is complete, inspect the work to ensure that all supports are secure and the area is safe.",
          },
          {
            step_number: 7,
            title: "Document the Damage",
            description:
              "Take photos and notes of the damage and stabilization process for future reference and insurance claims.",
          },
        ],
        activities: {
          "19-1-4": {
            activity: "Roof Sheathing Patch/Plug Repair (up to 8 inch x 8 inch)",
            unit_of_measurement: "each",
          },
          "6-3-3": {
            activity: "Curved Wall (Radius) Installation",
            unit_of_measurement: "sq ft",
          },
          "19-6-3": {
            activity: "Roof Damage Inspection",
            unit_of_measurement: "each",
          },
          "6-5-6": {
            activity: "Concrete Patching (up to 14 sq. ft.)",
            unit_of_measurement: "each",
          },
        },
      },
      flashingAndGutterRepair: {
        tools: [
          "Ladder",
          "Hammer",
          "Utility knife",
          "Roofing nails",
          "Roofing cement",
          "Pry bar",
          "Safety harness",
          "Caulking gun",
          "Gutter sealant",
          "Gutter screws",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Inspect the flashing and gutters to identify areas with leaks, rust, or physical damage. Take note of sections that require repair or replacement.",
          },
          {
            step_number: 2,
            title: "Clear Debris",
            description:
              "Remove any debris from the gutters and surrounding areas to ensure a clean workspace and prevent future blockages.",
          },
          {
            step_number: 3,
            title: "Remove Damaged Sections",
            description:
              "Carefully remove damaged flashing or gutter sections using a pry bar and utility knife. Ensure that the area is clean and ready for new materials.",
          },
          {
            step_number: 4,
            title: "Install New Flashing or Gutter Sections",
            description:
              "Install the new flashing or gutter sections, securing them with roofing nails or screws. Apply roofing cement or gutter sealant to ensure watertight connections.",
          },
          {
            step_number: 5,
            title: "Seal and Secure",
            description:
              "Use a caulking gun to apply sealant along the seams and edges of the flashing or gutters. Ensure all sections are secure and sealed properly to prevent future leaks.",
          },
          {
            step_number: 6,
            title: "Inspect the Repair",
            description:
              "Once repairs are complete, inspect the area to ensure the flashing and gutters are properly installed and sealed. Check for any remaining leaks or issues.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair work for future reference and to assist with any insurance claims.",
          },
        ],
        activities: {
          "19-1-2": {
            activity: "Flashing Repair",
            unit_of_measurement: "each",
          },
          "19-7-4": {
            activity: "Gutter Repair",
            unit_of_measurement: "each",
          },
          "19-7-1": {
            activity: "Gutter Downspout Installation",
            unit_of_measurement: "lin ft",
          },
          "19-7-5": {
            activity: "Gutter Removal",
            unit_of_measurement: "lin ft",
          },
        },
      },
    },
  },
  LocksOpening: {
    services: {
      emergencyLockoutServices: {
        tools: [
          "Lock pick set",
          "Tension wrench",
          "Slim Jim",
          "Bump key",
          "Drill (if necessary)",
          "Screwdriver set",
          "Lubricant spray",
          "Safety gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Lock Type",
            description:
              "Identify the type of lock and determine the appropriate method for unlocking it without causing damage.",
          },
          {
            step_number: 2,
            title: "Attempt Non-Destructive Entry",
            description:
              "Use a lock pick set, tension wrench, or bump key to attempt to unlock the door without damaging the lock.",
          },
          {
            step_number: 3,
            title: "Use Slim Jim for Car Lockouts",
            description:
              "If locked out of a vehicle, use a Slim Jim to access the lock mechanism through the window.",
          },
          {
            step_number: 4,
            title: "Lubricate the Lock",
            description:
              "If the lock is stiff or jammed, apply a lubricant spray to ease the unlocking process.",
          },
          {
            step_number: 5,
            title: "Drill the Lock (if necessary)",
            description:
              "As a last resort, drill the lock to gain entry. This will require replacing the lock afterward.",
          },
          {
            step_number: 6,
            title: "Replace the Lock (if drilled)",
            description:
              "If the lock was drilled, replace it with a new one, ensuring proper installation and security.",
          },
          {
            step_number: 7,
            title: "Test the Lock",
            description:
              "After unlocking or replacing the lock, test it to ensure it functions correctly and securely.",
          },
          {
            step_number: 8,
            title: "Document the Service",
            description:
              "Take notes and photos of the process, especially if the lock was damaged or replaced. Provide a summary for future reference.",
          },
        ],
        activities: {
          "6-6-1": {
            activity: "Interior Door Removal",
            unit_of_measurement: "each",
          },
          "6-6-2": {
            activity: "Interior Door Installation",
            unit_of_measurement: "each",
          },
          "15-3-2": {
            activity: "Smart Lock Maintenance and Troubleshooting",
            unit_of_measurement: "each",
          },
        },
      },
      brokenKeyExtraction: {
        tools: [
          "Broken key extractor set",
          "Needle-nose pliers",
          "Tweezers",
          "Lubricant spray",
          "Small flashlight",
          "Magnifying glass",
          "Tension wrench",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Situation",
            description:
              "Determine the position of the broken key and the condition of the lock. Check if the key is visible and accessible.",
          },
          {
            step_number: 2,
            title: "Lubricate the Lock",
            description:
              "Apply a lubricant spray to the lock to loosen the broken key fragment and make extraction easier.",
          },
          {
            step_number: 3,
            title: "Insert the Extractor Tool",
            description:
              "Carefully insert the broken key extractor tool into the lock, aligning it with the grooves of the broken key fragment.",
          },
          {
            step_number: 4,
            title: "Engage the Key Fragment",
            description:
              "Use gentle pressure to engage the key fragment with the extractor tool. Slowly pull the tool outward, bringing the key fragment with it.",
          },
          {
            step_number: 5,
            title: "Remove the Fragment",
            description:
              "Once the key fragment is visible, use needle-nose pliers or tweezers to fully extract it from the lock.",
          },
          {
            step_number: 6,
            title: "Test the Lock",
            description:
              "After extraction, test the lock with a spare key to ensure it is functioning properly and not damaged.",
          },
          {
            step_number: 7,
            title: "Document the Extraction",
            description:
              "Take notes and photos of the extraction process for future reference or to assist with any necessary lock repairs.",
          },
        ],
        activities: {
          "17-3-1": {
            activity: "Minor Surface and Structural Repair",
            unit_of_measurement: "item",
          },
          "17-3-4": {
            activity: "Hardware Replacement",
            unit_of_measurement: "item",
          },
        },
      },
      lockRepairAndReplacement: {
        tools: [
          "Lock pick set",
          "Tension wrench",
          "Screwdriver set",
          "Drill",
          "Replacement lock",
          "Lubricant spray",
          "Needle-nose pliers",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Lock",
            description:
              "Determine the extent of the damage to the lock and whether it can be repaired or needs replacement.",
          },
          {
            step_number: 2,
            title: "Lubricate the Lock",
            description:
              "Apply a lubricant spray to the lock mechanism to loosen any stuck components and facilitate repair or removal.",
          },
          {
            step_number: 3,
            title: "Disassemble the Lock",
            description:
              "Use the screwdriver set to carefully disassemble the lock, removing screws and internal components as necessary.",
          },
          {
            step_number: 4,
            title: "Repair or Replace Components",
            description:
              "If possible, repair any damaged components. If the lock is beyond repair, proceed with installing a new lock.",
          },
          {
            step_number: 5,
            title: "Reassemble and Test",
            description:
              "Reassemble the lock and test it to ensure it operates smoothly. Make any final adjustments as needed.",
          },
          {
            step_number: 6,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair or replacement process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "15-3-2": {
            activity: "Smart Lock Maintenance and Troubleshooting",
            unit_of_measurement: "each",
          },
          "17-3-1": {
            activity: "Minor Surface and Structural Repair",
            unit_of_measurement: "item",
          },
          "17-3-4": {
            activity: "Hardware Replacement",
            unit_of_measurement: "item",
          },
        },
      },
      rekeyingServicesAfterBreakIn: {
        tools: [
          "Rekeying kit",
          "Screwdriver set",
          "Needle-nose pliers",
          "Cylinder removal tool",
          "Lubricant spray",
          "Replacement pins",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Lock",
            description:
              "Inspect the lock for any physical damage caused during the break-in. Determine if rekeying is a viable solution or if a full replacement is necessary.",
          },
          {
            step_number: 2,
            title: "Disassemble the Lock",
            description:
              "Use a screwdriver set to remove the lock cylinder from the door. Carefully disassemble the lock to access the pins and internal components.",
          },
          {
            step_number: 3,
            title: "Remove the Old Pins",
            description:
              "Using the rekeying kit, remove the old pins from the lock cylinder. Clean out any debris or old lubricant to ensure smooth operation.",
          },
          {
            step_number: 4,
            title: "Insert New Pins",
            description:
              "Select the appropriate replacement pins and insert them into the lock cylinder according to the rekeying instructions. Ensure the pins are seated properly.",
          },
          {
            step_number: 5,
            title: "Reassemble the Lock",
            description:
              "Reassemble the lock cylinder and reinstall it into the door. Test the lock with the new key to ensure it operates smoothly.",
          },
          {
            step_number: 6,
            title: "Lubricate and Final Test",
            description:
              "Apply a lubricant spray to the lock mechanism to ensure smooth operation. Perform a final test to verify that the rekeying was successful.",
          },
          {
            step_number: 7,
            title: "Document the Rekeying",
            description:
              "Take notes and photos of the rekeying process for future reference or to assist with any follow-up actions needed.",
          },
        ],
        activities: {
          "17-3-1": {
            activity: "Minor Surface and Structural Repair",
            unit_of_measurement: "item",
          },
          "17-3-4": {
            activity: "Hardware Replacement",
            unit_of_measurement: "item",
          },
        },
      },
    },
  },
  WindowsAndDoorsRepairing: {
    services: {
      brokenWindowRepairs: {
        tools: [
          "Glazier's knife",
          "Putty knife",
          "Utility knife",
          "Replacement glass",
          "Glazing points",
          "Glazing putty",
          "Measuring tape",
          "Safety gloves",
          "Safety goggles",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Inspect the broken window to determine the extent of the damage and identify the type and size of the glass required for replacement.",
          },
          {
            step_number: 2,
            title: "Remove Broken Glass",
            description:
              "Carefully remove any loose or broken glass pieces from the window frame. Use safety gloves and goggles to protect against injury.",
          },
          {
            step_number: 3,
            title: "Prepare the Frame",
            description:
              "Clean out the window frame by removing old putty and glazing points. Ensure the frame is smooth and free of debris.",
          },
          {
            step_number: 4,
            title: "Measure and Cut Replacement Glass",
            description:
              "Measure the dimensions of the window opening and cut the replacement glass to the correct size, leaving a small gap for expansion.",
          },
          {
            step_number: 5,
            title: "Install New Glass",
            description:
              "Set the replacement glass into the frame, securing it with glazing points placed at regular intervals around the frame.",
          },
          {
            step_number: 6,
            title: "Apply Glazing Putty",
            description:
              "Apply glazing putty around the edges of the glass, smoothing it with a putty knife to create a watertight seal.",
          },
          {
            step_number: 7,
            title: "Allow Putty to Cure",
            description:
              "Allow the glazing putty to cure according to the manufacturer's instructions before painting or finishing.",
          },
          {
            step_number: 8,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair process for future reference or to assist with any necessary follow-up actions.",
          },
        ],
        activities: {
          "6-7-1": {
            activity: "Window Reglazing (up to 24x36 inches)",
            unit_of_measurement: "each",
          },
          "6-7-6": {
            activity: "Window Removal",
            unit_of_measurement: "each",
          },
          "6-7-2": {
            activity: "Aluminum Window Installation (up to 40 square feet)",
            unit_of_measurement: "each",
          },
        },
      },
      doorFrameDamage: {
        tools: [
          "Pry bar",
          "Hammer",
          "Chisel",
          "Screwdriver set",
          "Wood filler",
          "Sandpaper",
          "Measuring tape",
          "Level",
          "Safety goggles",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Inspect the door frame for any cracks, warping, or other structural issues. Determine if the damage can be repaired or if the frame needs to be replaced.",
          },
          {
            step_number: 2,
            title: "Remove Damaged Sections",
            description:
              "Use a pry bar and chisel to carefully remove the damaged sections of the door frame. Ensure that the remaining structure is solid and level.",
          },
          {
            step_number: 3,
            title: "Repair or Replace Frame",
            description:
              "If possible, repair the damaged sections using wood filler and sandpaper. For more severe damage, measure and cut replacement sections from new wood, then install them securely.",
          },
          {
            step_number: 4,
            title: "Reassemble and Reinforce",
            description:
              "Reassemble the frame, ensuring all components are properly aligned and secured. Reinforce any weak points to prevent future damage.",
          },
          {
            step_number: 5,
            title: "Finish the Repair",
            description:
              "Smooth the surface with sandpaper and apply a finish that matches the existing frame. Make sure the door operates smoothly within the repaired frame.",
          },
          {
            step_number: 6,
            title: "Inspect and Test",
            description:
              "Inspect the completed repair to ensure structural integrity. Test the door's functionality to confirm the repair's success.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "6-6-1": {
            activity: "Interior Door Removal",
            unit_of_measurement: "each",
          },
          "6-6-2": {
            activity: "Interior Door Installation",
            unit_of_measurement: "each",
          },
          "17-3-1": {
            activity: "Minor Surface and Structural Repair",
            unit_of_measurement: "item",
          },
        },
      },
      emergencyBoardingUpServices: {
        tools: [
          "Hammer",
          "Nails",
          "Plywood sheets",
          "Measuring tape",
          "Utility knife",
          "Screwdriver",
          "Screws",
          "Safety goggles",
          "Gloves",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Situation",
            description:
              "Evaluate the extent of the damage and identify the areas that require boarding up to prevent further damage or unauthorized access.",
          },
          {
            step_number: 2,
            title: "Measure the Openings",
            description:
              "Measure the windows or doors that need to be boarded up to ensure that the plywood sheets fit properly.",
          },
          {
            step_number: 3,
            title: "Cut the Plywood",
            description:
              "Cut the plywood sheets to the appropriate size using a utility knife or saw, ensuring that they cover the openings completely.",
          },
          {
            step_number: 4,
            title: "Secure the Plywood",
            description:
              "Position the plywood sheets over the openings and secure them in place using nails or screws. Ensure that the boards are tightly secured to withstand external forces.",
          },
          {
            step_number: 5,
            title: "Check for Gaps",
            description:
              "Inspect the boarded-up areas for any gaps or weaknesses that could allow wind, rain, or unauthorized entry. Make adjustments as necessary.",
          },
          {
            step_number: 6,
            title: "Document the Work",
            description:
              "Take photos and notes of the boarding-up process for future reference or insurance claims.",
          },
          {
            step_number: 7,
            title: "Ensure Safety",
            description:
              "Make sure that the boarded-up areas are secure and that there are no sharp edges or protruding nails that could pose a safety hazard.",
          },
        ],
        activities: {
          "6-7-6": {
            activity: "Window Removal",
            unit_of_measurement: "each",
          },
          "6-6-3": {
            activity: "Exterior Door Installation",
            unit_of_measurement: "each",
          },
          "6-6-10": {
            activity: "Garage Door Repair",
            unit_of_measurement: "each",
          },
          "13-9-1": {
            activity: "Full Scale Drywall Removal",
            unit_of_measurement: "sq ft",
          },
        },
      },
      lockRepairAndReplacement: {
        tools: [
          "Screwdriver set",
          "Drill",
          "Replacement lock",
          "Lubricant spray",
          "Needle-nose pliers",
          "Hammer",
          "Chisel",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Lock",
            description:
              "Inspect the lock for any physical damage or malfunction. Determine whether it can be repaired or needs to be replaced.",
          },
          {
            step_number: 2,
            title: "Disassemble the Lock",
            description:
              "Use a screwdriver set to remove the lock from the door. Carefully disassemble the lock to access its internal components.",
          },
          {
            step_number: 3,
            title: "Repair or Replace Components",
            description:
              "Repair the lock if possible, or install a new replacement lock. Ensure that all components are properly aligned and secure.",
          },
          {
            step_number: 4,
            title: "Reassemble and Test",
            description:
              "Reassemble the lock and test its functionality. Ensure it operates smoothly and securely.",
          },
          {
            step_number: 5,
            title: "Lubricate and Final Adjustments",
            description:
              "Apply lubricant spray to the lock mechanism for smooth operation. Make any final adjustments as needed.",
          },
          {
            step_number: 6,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair or replacement process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "17-3-1": {
            activity: "Minor Surface and Structural Repair",
            unit_of_measurement: "item",
          },
          "17-3-2": {
            activity: "Cabinet Mechanism Repairs",
            unit_of_measurement: "item",
          },
          "17-3-4": {
            activity: "Hardware Replacement",
            unit_of_measurement: "item",
          },
        },
      },
    },
  },
  Cleaning: {
    services: {
      postDisasterCleanups: {
        tools: [
          "Industrial vacuum",
          "Dehumidifier",
          "Air scrubber",
          "Mold remediation kit",
          "Protective gloves",
          "Protective eyewear",
          "Face masks",
          "Disinfectants",
          "Heavy-duty trash bags",
          "Squeegee",
          "Mop and bucket",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Damage",
            description:
              "Inspect the affected area to determine the extent of fire, water, or storm damage. Identify any structural issues, standing water, or hazardous materials.",
          },
          {
            step_number: 2,
            title: "Remove Standing Water",
            description:
              "Use industrial vacuums and pumps to remove standing water from the area. Ensure all water is extracted to prevent mold growth.",
          },
          {
            step_number: 3,
            title: "Dry and Dehumidify",
            description:
              "Set up dehumidifiers and air movers to dry out the space. Ensure that moisture levels are reduced to prevent further damage and mold growth.",
          },
          {
            step_number: 4,
            title: "Clean and Disinfect",
            description:
              "Thoroughly clean and disinfect all affected surfaces. Use appropriate cleaning agents to remove soot, debris, and contaminants left by the disaster.",
          },
          {
            step_number: 5,
            title: "Mold Remediation",
            description:
              "If necessary, conduct mold remediation using specialized kits. Ensure that all mold is removed and that the area is safe and healthy.",
          },
          {
            step_number: 6,
            title: "Dispose of Debris",
            description:
              "Collect and dispose of any debris, damaged materials, and waste. Use heavy-duty trash bags and arrange for proper disposal.",
          },
          {
            step_number: 7,
            title: "Final Inspection",
            description:
              "Conduct a final inspection to ensure that all damage has been addressed and that the area is clean, dry, and safe for use.",
          },
          {
            step_number: 8,
            title: "Document the Cleanup",
            description:
              "Take photos and notes of the cleanup process for future reference or to assist with insurance claims.",
          },
        ],
        activities: {
          "12-7-1": {
            activity: "Flood Damage Cleanup",
            unit_of_measurement: "sq ft",
          },
          "12-7-2": {
            activity: "Fire and Smoke Damage Cleanup",
            unit_of_measurement: "sq ft",
          },
          "13-9-3": {
            activity: "Debris Management and Disposal",
            unit_of_measurement: "sq ft",
          },
          "12-8-1": {
            activity: "Chemical Spill Cleanup",
            unit_of_measurement: "sq ft",
          },
        },
      },
      emergencySanitation: {
        tools: [
          "Industrial sanitizer sprayer",
          "Protective gloves",
          "Protective eyewear",
          "Face masks",
          "Disinfectant solutions",
          "Mop and bucket",
          "Biohazard waste bags",
          "Decontamination equipment",
          "Air scrubber",
          "Ventilation fans",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Contamination",
            description:
              "Identify and evaluate the affected areas to determine the level of sanitation required. Check for hazardous materials or biohazards that need special handling.",
          },
          {
            step_number: 2,
            title: "Prepare the Area",
            description:
              "Set up decontamination zones if necessary, and ensure that all workers have appropriate protective gear before starting the sanitation process.",
          },
          {
            step_number: 3,
            title: "Sanitize the Area",
            description:
              "Use industrial sanitizer sprayers and disinfectant solutions to thoroughly clean all affected surfaces. Pay special attention to high-contact areas and potential biohazard sites.",
          },
          {
            step_number: 4,
            title: "Dispose of Waste",
            description:
              "Safely collect and dispose of contaminated materials using biohazard waste bags. Ensure that all waste is properly sealed and transported for disposal.",
          },
          {
            step_number: 5,
            title: "Ventilate and Scrub the Air",
            description:
              "Use air scrubbers and ventilation fans to clear the air of any lingering contaminants. Ensure that the area is safe to re-enter after sanitation.",
          },
          {
            step_number: 6,
            title: "Final Inspection",
            description:
              "Inspect the area to ensure that all contamination has been addressed. Re-sanitize if necessary, and confirm that the space is safe for use.",
          },
          {
            step_number: 7,
            title: "Document the Sanitation",
            description:
              "Take photos and notes of the sanitation process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "12-7-1": {
            activity: "Flood Damage Cleanup",
            unit_of_measurement: "sq ft",
          },
          "12-8-1": {
            activity: "Chemical Spill Cleanup",
            unit_of_measurement: "sq ft",
          },
          "12-8-2": {
            activity: "Crime Scene Cleanup",
            unit_of_measurement: "sq ft",
          },
        },
      },
      biohazardAndCrimeSceneCleaning: {
        tools: [
          "Biohazard suit",
          "Face mask with respirator",
          "Disposable gloves",
          "Goggles",
          "Biohazard waste bags",
          "Disinfectants",
          "Industrial-grade cleaner",
          "Scrub brushes",
          "Mop and bucket",
          "Wet/dry vacuum",
        ],
        steps: [
          {
            step_number: 1,
            title: "Secure the Area",
            description:
              "Ensure the area is safe and secure, restricting access to authorized personnel only. Set up barriers or signage as needed.",
          },
          {
            step_number: 2,
            title: "Assess the Contamination",
            description:
              "Evaluate the extent of the contamination, including the presence of bloodborne pathogens, bodily fluids, and other biohazards.",
          },
          {
            step_number: 3,
            title: "Remove Biohazard Materials",
            description:
              "Carefully remove any biohazard materials and place them in designated biohazard waste bags. Ensure proper disposal according to local regulations.",
          },
          {
            step_number: 4,
            title: "Clean and Disinfect",
            description:
              "Thoroughly clean and disinfect all surfaces affected by the contamination. Use industrial-grade cleaners and disinfectants to eliminate any pathogens.",
          },
          {
            step_number: 5,
            title: "Decontaminate the Area",
            description:
              "After cleaning, decontaminate the area using appropriate techniques to ensure that it is safe for future use.",
          },
          {
            step_number: 6,
            title: "Dispose of Waste",
            description:
              "Properly dispose of all biohazard waste, including gloves, suits, and cleaning materials, according to local health and safety regulations.",
          },
          {
            step_number: 7,
            title: "Final Inspection",
            description:
              "Conduct a final inspection to ensure the area is thoroughly cleaned and decontaminated. Document the process with photos and notes.",
          },
        ],
        activities: {
          "12-8-1": {
            activity: "Chemical Spill Cleanup",
            unit_of_measurement: "sq ft",
          },
          "12-8-2": {
            activity: "Crime Scene Cleanup",
            unit_of_measurement: "sq ft",
          },
          "13-9-3": {
            activity: "Debris Management and Disposal",
            unit_of_measurement: "sq ft",
          },
        },
      },
    },
  },
  HVAC: {
    services: {
      emergencyHeatingCoolingRestoration: {
        tools: [
          "Multimeter",
          "Thermometer",
          "Refrigerant gauges",
          "Vacuum pump",
          "Recovery machine",
          "Screwdriver set",
          "Wrench set",
          "Replacement filters",
          "Protective gloves",
          "Safety goggles",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the System",
            description:
              "Evaluate the heating or cooling system to identify the source of the failure. Check for power issues, thermostat settings, and any obvious signs of malfunction.",
          },
          {
            step_number: 2,
            title: "Check and Replace Filters",
            description:
              "Inspect the air filters for dirt and blockage. Replace filters if necessary to ensure proper airflow.",
          },
          {
            step_number: 3,
            title: "Test Electrical Components",
            description:
              "Use a multimeter to test the electrical components of the system, including the thermostat, circuit boards, and wiring connections. Replace faulty components as needed.",
          },
          {
            step_number: 4,
            title: "Inspect and Recharge Refrigerant",
            description:
              "Check the refrigerant levels and recharge the system if necessary. Use refrigerant gauges and a recovery machine to safely handle the refrigerant.",
          },
          {
            step_number: 5,
            title: "Test Heating Elements or Cooling Coils",
            description:
              "Inspect the heating elements in a furnace or the cooling coils in an air conditioning unit. Ensure they are functioning properly and replace any damaged parts.",
          },
          {
            step_number: 6,
            title: "Calibrate the Thermostat",
            description:
              "Test and calibrate the thermostat to ensure accurate temperature control. Adjust the settings as needed to restore proper operation.",
          },
          {
            step_number: 7,
            title: "Perform System Tests",
            description:
              "Run the system to verify that heating or cooling has been restored. Monitor the performance and make any final adjustments.",
          },
          {
            step_number: 8,
            title: "Document the Restoration",
            description:
              "Take notes and photos of the restoration process for future reference or to assist with any necessary follow-up actions.",
          },
        ],
        activities: {
          "7-1-3": {
            activity: "Furnace Cleaning, Servicing, and Filter Replacement",
            unit_of_measurement: "each",
          },
          "7-2-4": {
            activity: "Boiler Regular Maintenance",
            unit_of_measurement: "each",
          },
          "7-9-3": {
            activity: "Electric Wall Heater Installation",
            unit_of_measurement: "each",
          },
          "7-5-4": {
            activity: "Window AC Diagnostic and Troubleshooting",
            unit_of_measurement: "each",
          },
          "7-10-4": {
            activity: "Humidifier/Dehumidifier Maintenance",
            unit_of_measurement: "each",
          },
        },
      },
      furnaceBreakdowns: {
        tools: [
          "Screwdriver set",
          "Multimeter",
          "Wrench set",
          "Replacement furnace parts (as needed)",
          "Vacuum cleaner",
          "Protective gloves",
          "Safety goggles",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Furnace",
            description:
              "Inspect the furnace to diagnose the issue. Check for signs of wear, faulty components, or system malfunctions.",
          },
          {
            step_number: 2,
            title: "Turn Off Power and Gas",
            description:
              "Turn off the power to the furnace and shut off the gas supply to ensure safety during repairs.",
          },
          {
            step_number: 3,
            title: "Disassemble the Furnace",
            description:
              "Carefully disassemble the furnace components to access the malfunctioning parts. Keep track of all screws and components.",
          },
          {
            step_number: 4,
            title: "Replace or Repair Components",
            description:
              "Replace or repair the faulty components, such as the ignitor, burner, or control board, depending on the diagnosis.",
          },
          {
            step_number: 5,
            title: "Reassemble the Furnace",
            description:
              "Reassemble the furnace, ensuring all components are securely fastened and properly connected.",
          },
          {
            step_number: 6,
            title: "Test the Furnace",
            description:
              "Restore power and gas to the furnace and test it to ensure it operates correctly and safely.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "7-1-2": {
            activity: "Furnace Installation",
            unit_of_measurement: "each",
          },
          "7-1-3": {
            activity: "Furnace Cleaning, Servicing, and Filter Replacement",
            unit_of_measurement: "each",
          },
          "7-1-4": {
            activity: "Furnace Ignitor Replacement",
            unit_of_measurement: "each",
          },
          "7-1-6": {
            activity: "Burner Replacement",
            unit_of_measurement: "each",
          },
          "7-1-7": {
            activity: "Control Board Replacement",
            unit_of_measurement: "each",
          },
        },
      },
      acUnitRepairs: {
        tools: [
          "Multimeter",
          "Voltage tester",
          "Refrigerant gauges",
          "Screwdriver set",
          "Wrench set",
          "Thermometer",
          "HVAC leak detector",
          "Replacement capacitors",
          "Refrigerant",
        ],
        steps: [
          {
            step_number: 1,
            title: "Turn Off the AC Unit",
            description:
              "Before the specialist arrives, ensure the AC unit is turned off to prevent further damage. Locate the unit's circuit breaker and switch it off.",
          },
          {
            step_number: 2,
            title: "Clear the Area Around the Unit",
            description:
              "Remove any objects, plants, or debris around the AC unit to provide clear access for the specialist.",
          },
          {
            step_number: 3,
            title: "Inspect the AC Unit",
            description:
              "The specialist will inspect the air conditioning unit to diagnose the issue. They will check for electrical faults, refrigerant leaks, and mechanical failures.",
          },
          {
            step_number: 4,
            title: "Check Electrical Components",
            description:
              "The specialist will test the electrical components such as the capacitor, contactor, and wiring to ensure they are functioning correctly.",
          },
          {
            step_number: 5,
            title: "Check Refrigerant Levels",
            description:
              "Using refrigerant gauges, the specialist will check the refrigerant levels. If low, they will identify and repair any leaks before recharging the system.",
          },
          {
            step_number: 6,
            title: "Inspect the Condenser and Evaporator Coils",
            description:
              "The specialist will examine the condenser and evaporator coils for signs of dirt, damage, or ice buildup. They will clean or repair them as necessary.",
          },
          {
            step_number: 7,
            title: "Repair or Replace Components",
            description:
              "The specialist will repair or replace any faulty components such as the capacitor, compressor, or fan motor. All repairs will meet safety standards.",
          },
          {
            step_number: 8,
            title: "Test the AC Unit",
            description:
              "After completing repairs, the specialist will test the AC unit to ensure it is cooling effectively and operating efficiently.",
          },
          {
            step_number: 9,
            title: "Final Inspection",
            description:
              "The specialist will conduct a final inspection to verify that all issues have been resolved and the AC unit is functioning properly.",
          },
          {
            step_number: 10,
            title: "Document the Repair",
            description:
              "The specialist will take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "7-5-4": {
            activity: "Window AC Diagnostic and Troubleshooting",
            unit_of_measurement: "each",
          },
          "7-4-5": {
            activity: "Mini Split Air Conditioner Diagnostics and Troubleshooting",
            unit_of_measurement: "each",
          },
          "7-4-7": {
            activity: "Mini Split Air Conditioner Refrigerant Management",
            unit_of_measurement: "each",
          },
          "7-4-6": {
            activity: "Mini Split Air Conditioner Routine Maintenance",
            unit_of_measurement: "each",
          },
        },
      },
      ventilationProblems: {
        tools: [
          "Multimeter",
          "Screwdriver set",
          "Wrench set",
          "Duct tape",
          "Ventilation system cleaner",
          "Replacement filters",
          "HVAC leak detector",
          "Ladder",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Ventilation System",
            description:
              "Inspect the ventilation system to diagnose the issue. Check for blockages, leaks, and malfunctioning components.",
          },
          {
            step_number: 2,
            title: "Check Airflow and Ductwork",
            description:
              "Test the airflow through the system and inspect the ductwork for any obstructions, disconnections, or leaks.",
          },
          {
            step_number: 3,
            title: "Clean the Ventilation System",
            description:
              "Use a ventilation system cleaner to remove dust, debris, and mold from the ducts and vents. Replace filters if necessary.",
          },
          {
            step_number: 4,
            title: "Repair or Replace Components",
            description:
              "Repair or replace any faulty components such as fans, motors, or belts to ensure proper operation of the ventilation system.",
          },
          {
            step_number: 5,
            title: "Test the System",
            description:
              "After completing repairs, test the ventilation system to ensure it is functioning efficiently and effectively.",
          },
          {
            step_number: 6,
            title: "Final Inspection",
            description:
              "Conduct a final inspection to verify that all issues have been resolved and that the ventilation system is working properly.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "7-6-4": {
            activity: "Ventilation System Duct Cleaning and Maintenance",
            unit_of_measurement: "each",
          },
          "7-6-5": {
            activity: "Ventilation System Motor and Belt Replacement",
            unit_of_measurement: "each",
          },
          "7-6-6": {
            activity: "Ventilation System Balancing",
            unit_of_measurement: "each",
          },
          "7-6-7": {
            activity: "Ventilation System Vibration and Noise Reduction",
            unit_of_measurement: "each",
          },
        },
      },
    },
  },
  Structural: {
    services: {
      emergencyStabilizationOfCompromisedStructures: {
        tools: [
          "Support beams",
          "Jacks and shoring",
          "Pry bar",
          "Hammer",
          "Screws and nails",
          "Safety harness",
          "Measuring tape",
          "Level",
          "Wooden planks",
          "Concrete mix",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Structural Damage",
            description:
              "Carefully inspect the compromised structure to identify areas that require immediate stabilization. Determine the extent of the damage and any risks involved.",
          },
          {
            step_number: 2,
            title: "Clear the Area",
            description:
              "Remove any debris, loose materials, or obstructions that could pose a hazard during the stabilization process. Ensure the area is safe for workers.",
          },
          {
            step_number: 3,
            title: "Install Temporary Supports",
            description:
              "Use support beams, jacks, and shoring to temporarily brace the damaged areas. Ensure that the supports are properly positioned and securely anchored.",
          },
          {
            step_number: 4,
            title: "Reinforce Structural Elements",
            description:
              "Reinforce the compromised structural elements with additional wood or metal bracing as needed. Secure all reinforcements with screws, nails, or other fasteners.",
          },
          {
            step_number: 5,
            title: "Apply Emergency Patching",
            description:
              "Use wooden planks, concrete mix, or other suitable materials to patch any immediate threats to structural integrity. This will help prevent further damage until permanent repairs can be made.",
          },
          {
            step_number: 6,
            title: "Inspect the Stabilization",
            description:
              "Once the stabilization is complete, thoroughly inspect the work to ensure that all supports are secure and the area is safe.",
          },
          {
            step_number: 7,
            title: "Document the Stabilization",
            description:
              "Take photos and detailed notes of the damage and the stabilization process for future reference, insurance claims, or further repair planning.",
          },
        ],
        activities: {
          "6-3-1": {
            activity: "6-Inch Load-Bearing Wall Installation",
            unit_of_measurement: "sq ft",
          },
          "6-3-2": {
            activity: "Framing Repair and Reinforcement",
            unit_of_measurement: "sq ft",
          },
          "6-5-6": {
            activity: "Concrete Patching (up to 14 sq. ft.)",
            unit_of_measurement: "each",
          },
          "6-5-1": {
            activity: "Foundation Crack Repair",
            unit_of_measurement: "lin ft",
          },
        },
      },
      damageAssessmentAndTemporaryFixesPostNaturalDisaster: {
        tools: [
          "Measuring tape",
          "Level",
          "Camera (for documentation)",
          "Notebook and pen",
          "Temporary support beams",
          "Plywood sheets",
          "Tarps",
          "Screws and nails",
          "Hammer",
          "Safety gear (gloves, helmet, harness)",
        ],
        steps: [
          {
            step_number: 1,
            title: "Initial Damage Assessment",
            description:
              "Conduct a thorough inspection of the structure to assess the extent of damage caused by the natural disaster. Identify areas that require immediate attention.",
          },
          {
            step_number: 2,
            title: "Document the Damage",
            description:
              "Take detailed notes and photographs of all damaged areas. This documentation will be essential for insurance claims and future repairs.",
          },
          {
            step_number: 3,
            title: "Identify Immediate Hazards",
            description:
              "Identify any structural hazards that pose an immediate risk, such as collapsing walls, exposed wiring, or leaking gas lines. Ensure the area is safe before proceeding.",
          },
          {
            step_number: 4,
            title: "Install Temporary Supports",
            description:
              "Use support beams and other materials to temporarily stabilize compromised structural elements. Ensure that these supports are secure and provide adequate reinforcement.",
          },
          {
            step_number: 5,
            title: "Apply Temporary Fixes",
            description:
              "Cover exposed areas with plywood or tarps to protect against further weather damage. Use screws, nails, and other fasteners to secure these temporary fixes.",
          },
          {
            step_number: 6,
            title: "Inspect and Adjust",
            description:
              "Inspect the temporary fixes to ensure they are holding up and providing the necessary protection. Make any adjustments as needed to improve stability and safety.",
          },
          {
            step_number: 7,
            title: "Prepare for Permanent Repairs",
            description:
              "Create a detailed plan for permanent repairs, based on the assessment and temporary fixes. This plan should prioritize safety and structural integrity.",
          },
          {
            step_number: 8,
            title: "Document the Temporary Fixes",
            description:
              "Take final photos and notes of the temporary fixes for future reference. This documentation will assist in planning and executing permanent repairs.",
          },
        ],
        activities: {
          "6-5-1": {
            activity: "Foundation Crack Repair",
            unit_of_measurement: "lin ft",
          },
          "6-5-2": {
            activity: "Masonry Wall Crack Repair",
            unit_of_measurement: "sq ft",
          },
          "6-5-6": {
            activity: "Concrete Patching (up to 14 sq. ft.)",
            unit_of_measurement: "each",
          },
          "6-3-2": {
            activity: "Framing Repair and Reinforcement",
            unit_of_measurement: "sq ft",
          },
        },
      },
      urgentFoundationRepairs: {
        tools: [
          "Hydraulic jack",
          "Concrete mix",
          "Rebar",
          "Shovels",
          "Level",
          "Measuring tape",
          "Trowel",
          "Foundation repair brackets",
          "Safety gear (gloves, helmet, steel-toe boots)",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Foundation Damage",
            description:
              "Conduct a thorough inspection of the foundation to identify cracks, settling, or other structural issues that require immediate repair.",
          },
          {
            step_number: 2,
            title: "Document the Damage",
            description:
              "Take detailed notes and photographs of the foundation damage for reference during repairs and for insurance claims.",
          },
          {
            step_number: 3,
            title: "Excavate Around the Foundation",
            description:
              "Excavate the soil around the damaged area to expose the foundation. Ensure that the excavation is wide and deep enough to access the affected sections.",
          },
          {
            step_number: 4,
            title: "Install Temporary Supports",
            description:
              "Use hydraulic jacks and support beams to temporarily stabilize the structure while repairs are being made.",
          },
          {
            step_number: 5,
            title: "Repair Cracks and Settling",
            description:
              "Fill cracks with a suitable concrete mix and reinforce with rebar if necessary. For settling issues, use foundation repair brackets to lift and stabilize the structure.",
          },
          {
            step_number: 6,
            title: "Backfill and Compact Soil",
            description:
              "Once the repairs are complete, backfill the excavation with soil and compact it to ensure proper drainage and stability around the foundation.",
          },
          {
            step_number: 7,
            title: "Inspect the Repair",
            description:
              "Conduct a final inspection to ensure that the foundation repair has been completed correctly and that the structure is stable.",
          },
          {
            step_number: 8,
            title: "Document the Repair",
            description:
              "Take photos and notes of the completed repair for future reference, insurance claims, and to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "6-5-1": {
            activity: "Foundation Crack Repair",
            unit_of_measurement: "lin ft",
          },
          "6-5-4": {
            activity: "Foundation Reinforcement Installation",
            unit_of_measurement: "each",
          },
          "6-5-6": {
            activity: "Concrete Patching (up to 14 sq. ft.)",
            unit_of_measurement: "each",
          },
          "6-3-2": {
            activity: "Framing Repair and Reinforcement",
            unit_of_measurement: "sq ft",
          },
        },
      },
    },
  },
  GasServices: {
    services: {
      gasLeakDetectionAndRepair: {
        tools: [
          "Gas leak detector",
          "Soapy water solution",
          "Wrench set",
          "Pipe thread sealant",
          "Replacement gas fittings",
          "Pressure gauge",
          "Leak detection spray",
          "Safety gear (gloves, mask, goggles)",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Leak",
            description:
              "Use a gas leak detector or soapy water solution to identify the location of the gas leak. Listen for hissing sounds or look for bubbles forming.",
          },
          {
            step_number: 2,
            title: "Shut Off the Gas Supply",
            description:
              "Immediately shut off the gas supply to the affected area to prevent further leakage. Ensure the area is well-ventilated.",
          },
          {
            step_number: 3,
            title: "Assess the Damage",
            description:
              "Inspect the gas lines, fittings, and connections to determine the extent of the damage and the necessary repairs.",
          },
          {
            step_number: 4,
            title: "Repair or Replace Damaged Components",
            description:
              "Repair or replace any damaged gas lines, fittings, or connections. Use pipe thread sealant on new fittings to ensure a secure and leak-proof connection.",
          },
          {
            step_number: 5,
            title: "Test for Leaks",
            description:
              "After completing the repairs, use a pressure gauge and leak detection spray to test for any remaining leaks. Ensure the system is safe before restoring the gas supply.",
          },
          {
            step_number: 6,
            title: "Restore Gas Supply",
            description:
              "Once the system has been confirmed as leak-free, carefully restore the gas supply and monitor the area for any signs of leakage.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take photos and notes of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "14-1-1": {
            activity: "Gas Line Leak Repair",
            unit_of_measurement: "each",
          },
          "14-1-2": {
            activity: "Gas Fitting Replacement",
            unit_of_measurement: "each",
          },
          "14-1-3": {
            activity: "Gas Pressure Testing",
            unit_of_measurement: "each",
          },
          "14-1-4": {
            activity: "Emergency Gas Line Shut-Off Installation",
            unit_of_measurement: "each",
          },
        },
      },
      emergencyShutOffs: {
        tools: [
          "Gas shut-off wrench",
          "Pipe wrench",
          "Pressure gauge",
          "Leak detection spray",
          "Flashlight",
          "Safety gear (gloves, mask, goggles)",
          "Signage for warning and information",
        ],
        steps: [
          {
            step_number: 1,
            title: "Identify the Emergency",
            description:
              "Assess the situation to determine the need for an emergency gas shut-off, such as detecting a gas leak or fire risk.",
          },
          {
            step_number: 2,
            title: "Locate the Gas Shut-Off Valve",
            description:
              "Locate the main gas shut-off valve for the building or affected area. Ensure that you have clear access to the valve.",
          },
          {
            step_number: 3,
            title: "Shut Off the Gas Supply",
            description:
              "Use a gas shut-off wrench to turn the valve to the off position. Ensure that the gas supply is completely shut off.",
          },
          {
            step_number: 4,
            title: "Test for Gas Flow",
            description:
              "Use a pressure gauge or listen for any remaining gas flow to confirm that the gas supply has been fully shut off.",
          },
          {
            step_number: 5,
            title: "Post Warning Signs",
            description:
              "Place clear warning signs around the shut-off area to inform others that the gas supply has been turned off and to prevent reactivation.",
          },
          {
            step_number: 6,
            title: "Assess the Situation",
            description:
              "Evaluate the situation to determine the next steps, such as calling for repairs or emergency services.",
          },
          {
            step_number: 7,
            title: "Document the Shut-Off",
            description:
              "Take notes and photos of the shut-off process, including the time and location. This documentation is important for safety records and future reference.",
          },
        ],
        activities: {
          "14-1-4": {
            activity: "Emergency Gas Line Shut-Off Installation",
            unit_of_measurement: "each",
          },
          "14-1-3": {
            activity: "Gas Pressure Testing",
            unit_of_measurement: "each",
          },
          "14-1-5": {
            activity: "Gas Valve Inspection and Maintenance",
            unit_of_measurement: "each",
          },
          "14-1-6": {
            activity: "Gas Leak Testing and Detection",
            unit_of_measurement: "each",
          },
        },
      },
      carbonMonoxideIncidentManagement: {
        tools: [
          "Carbon monoxide detector",
          "Gas shut-off wrench",
          "Ventilation fans",
          "Oxygen masks (for emergency responders)",
          "Personal protective equipment (PPE)",
          "Signage for warning and evacuation",
          "Portable CO detectors",
          "First aid kit",
        ],
        steps: [
          {
            step_number: 1,
            title: "Evacuate the Area",
            description:
              "Immediately evacuate all occupants from the affected area to prevent carbon monoxide poisoning. Ensure that everyone moves to fresh air.",
          },
          {
            step_number: 2,
            title: "Shut Off the Gas Supply",
            description:
              "Use a gas shut-off wrench to turn off the gas supply to the building or affected area. This will stop the source of carbon monoxide if it is related to gas appliances.",
          },
          {
            step_number: 3,
            title: "Ventilate the Area",
            description:
              "Set up ventilation fans to disperse the carbon monoxide and bring fresh air into the area. Open windows and doors if safe to do so.",
          },
          {
            step_number: 4,
            title: "Test for Carbon Monoxide Levels",
            description:
              "Use a carbon monoxide detector to test the air quality and monitor CO levels. Continue ventilation until levels are safe.",
          },
          {
            step_number: 5,
            title: "Provide Medical Assistance",
            description:
              "If anyone shows symptoms of carbon monoxide poisoning (headache, dizziness, nausea), provide first aid and call emergency medical services immediately.",
          },
          {
            step_number: 6,
            title: "Investigate the Source",
            description:
              "Inspect gas appliances, chimneys, and vents to identify the source of carbon monoxide. Repair or replace faulty equipment as necessary.",
          },
          {
            step_number: 7,
            title: "Document the Incident",
            description:
              "Take notes and photos of the incident, including CO levels and the source of the leak. This documentation is essential for safety records and insurance claims.",
          },
        ],
        activities: {
          "14-2-1": {
            activity: "Carbon Monoxide Detector Installation",
            unit_of_measurement: "each",
          },
          "14-2-2": {
            activity: "CO Detector Testing and Maintenance",
            unit_of_measurement: "each",
          },
          "14-2-3": {
            activity: "Gas Appliance Safety Inspection",
            unit_of_measurement: "each",
          },
          "14-1-6": {
            activity: "Gas Leak Testing and Detection",
            unit_of_measurement: "each",
          },
        },
      },
    },
  },
  ApplianceRepair: {
    services: {
      urgentRefrigeratorRepairs: {
        tools: [
          "Multimeter",
          "Refrigerant gauges",
          "Screwdriver set",
          "Wrench set",
          "Vacuum pump",
          "Thermometer",
          "Replacement parts (compressor, fan motor, thermostat)",
          "Safety gear (gloves, goggles)",
        ],
        steps: [
          {
            step_number: 1,
            title: "Initial Assessment",
            description:
              "Inspect the refrigerator to identify the issue, such as cooling problems, leaks, or unusual noises.",
          },
          {
            step_number: 2,
            title: "Shut Off Power",
            description:
              "Turn off the power to the refrigerator to ensure safety during repairs.",
          },
          {
            step_number: 3,
            title: "Diagnose the Problem",
            description:
              "Use a multimeter and refrigerant gauges to diagnose issues with the compressor, fans, or electrical components.",
          },
          {
            step_number: 4,
            title: "Perform Necessary Repairs",
            description:
              "Repair or replace faulty components such as the compressor, fan motor, or thermostat. Ensure all connections are secure.",
          },
          {
            step_number: 5,
            title: "Test the Refrigerator",
            description:
              "Turn the power back on and test the refrigerator to ensure it is functioning correctly and cooling efficiently.",
          },
          {
            step_number: 6,
            title: "Final Inspection",
            description:
              "Conduct a final inspection to ensure all repairs are completed and the refrigerator is safe for use.",
          },
          {
            step_number: 7,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "14-1-6": {
            activity: "Refrigerator Not Cooling",
            unit_of_measurement: "each",
          },
          "14-1-7": {
            activity: "Refrigerator Overcooling",
            unit_of_measurement: "each",
          },
          "14-1-8": {
            activity: "Water Leakage Inside or Outside",
            unit_of_measurement: "each",
          },
          "14-1-9": {
            activity: "Buildup of Frost in the Freezer",
            unit_of_measurement: "each",
          },
          "14-1-10": {
            activity: "Ice Maker Not Working",
            unit_of_measurement: "each",
          },
          "14-1-11": {
            activity: "Fridge Making Strange Noises",
            unit_of_measurement: "each",
          },
          "14-1-12": {
            activity: "Malfunctioning Water Dispenser",
            unit_of_measurement: "each",
          },
          "14-1-14": {
            activity: "Refrigerator Door Not Sealing Properly",
            unit_of_measurement: "each",
          },
          "14-1-16": {
            activity: "Compressor Issues",
            unit_of_measurement: "each",
          },
          "14-1-17": {
            activity: "Refrigerant Leak",
            unit_of_measurement: "each",
          },
        },
      },
      cookingAppliancesRestoration: {
        tools: [
          "Multimeter",
          "Screwdriver set",
          "Wrench set",
          "Voltage tester",
          "Replacement heating elements",
          "Gas leak detector",
          "Thermometer",
          "Cleaning supplies",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Appliance",
            description:
              "Inspect the cooking appliance to determine the nature of the malfunction. Check for electrical, gas, or mechanical issues.",
          },
          {
            step_number: 2,
            title: "Shut Off Power/Gas",
            description:
              "Turn off the power supply or gas line to the appliance to ensure safety during the repair process.",
          },
          {
            step_number: 3,
            title: "Disassemble the Appliance",
            description:
              "Carefully disassemble the appliance to access the internal components that need repair or replacement.",
          },
          {
            step_number: 4,
            title: "Repair or Replace Faulty Parts",
            description:
              "Identify and replace faulty parts such as heating elements, thermostats, or burners. Ensure all replacements meet manufacturer specifications.",
          },
          {
            step_number: 5,
            title: "Check for Gas Leaks",
            description:
              "For gas appliances, use a gas leak detector to ensure there are no leaks after repairs. Secure all connections tightly.",
          },
          {
            step_number: 6,
            title: "Reassemble and Test",
            description:
              "Reassemble the appliance and restore power or gas supply. Test the appliance to ensure it is functioning properly and safely.",
          },
          {
            step_number: 7,
            title: "Final Inspection",
            description:
              "Conduct a final inspection of the appliance to verify that all issues have been resolved and that it is safe to use.",
          },
          {
            step_number: 8,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "11-1-1": {
            activity: "Oven Heating Element Replacement",
            unit_of_measurement: "each",
          },
          "11-1-2": {
            activity: "Stove Burner Replacement",
            unit_of_measurement: "each",
          },
          "11-1-3": {
            activity: "Thermostat Repair or Replacement",
            unit_of_measurement: "each",
          },
          "14-1-2": {
            activity: "Gas Fitting Replacement",
            unit_of_measurement: "each",
          },
        },
      },
      washingMachineAndDryerEmergencyServices: {
        tools: [
          "Multimeter",
          "Screwdriver set",
          "Wrench set",
          "Voltage tester",
          "Water pump pliers",
          "Replacement belts",
          "Drain snake",
          "Cleaning supplies",
          "Vacuum cleaner",
        ],
        steps: [
          {
            step_number: 1,
            title: "Assess the Appliance",
            description:
              "Inspect the washing machine or dryer to determine the nature of the malfunction. Check for electrical, water, or mechanical issues.",
          },
          {
            step_number: 2,
            title: "Shut Off Power/Water Supply",
            description:
              "Turn off the power supply and water line to the appliance to ensure safety during the repair process.",
          },
          {
            step_number: 3,
            title: "Disassemble the Appliance",
            description:
              "Carefully disassemble the appliance to access the internal components that need repair or replacement.",
          },
          {
            step_number: 4,
            title: "Clear Blockages and Drains",
            description:
              "If the issue is related to drainage, use a drain snake and cleaning supplies to clear any blockages in the hoses or pumps.",
          },
          {
            step_number: 5,
            title: "Repair or Replace Faulty Parts",
            description:
              "Identify and replace faulty parts such as belts, motors, or heating elements. Ensure all replacements meet manufacturer specifications.",
          },
          {
            step_number: 6,
            title: "Reassemble and Test",
            description:
              "Reassemble the appliance and restore power and water supply. Test the appliance to ensure it is functioning properly and safely.",
          },
          {
            step_number: 7,
            title: "Final Inspection",
            description:
              "Conduct a final inspection of the appliance to verify that all issues have been resolved and that it is safe to use.",
          },
          {
            step_number: 8,
            title: "Document the Repair",
            description:
              "Take notes and photos of the repair process for future reference or to assist with any necessary follow-up.",
          },
        ],
        activities: {
          "11-2-1": {
            activity: "Washing Machine Belt Replacement",
            unit_of_measurement: "each",
          },
          "11-2-2": {
            activity: "Dryer Heating Element Replacement",
            unit_of_measurement: "each",
          },
          "11-2-3": {
            activity: "Drain Pump Repair",
            unit_of_measurement: "each",
          },
          "11-2-4": {
            activity: "Vent Cleaning and Maintenance",
            unit_of_measurement: "each",
          },
        },
      },
    },
  },
};
