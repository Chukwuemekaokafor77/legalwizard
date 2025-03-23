const COURT_DATA = {
    ontario: {
      divorce: {
        name: "Ontario Superior Court of Justice",
        filingFee: 632,
        requirements: [
          "Original marriage certificate",
          "Completed Form 8A"
        ],
        locations: [
          {
            city: "Toronto",
            address: "393 University Ave, Toronto, ON M5G 1E6",
            filingMethods: ["in-person", "online"]
          }
        ]
      },
      childSupport: {
        name: "Ontario Court of Justice",
        filingFee: 227,
        requirements: [
          "Child's birth certificate",
          "Income verification documents"
        ]
      }
    }
  };
  
  export class CourtService {
    static async getCourtInfo(province, pathwayId) {
      return new Promise((resolve) => {
        setTimeout(() => { // Simulate API call
          resolve({
            ...COURT_DATA[province.toLowerCase()]?.[pathwayId],
            lastUpdated: new Date().toISOString()
          });
        }, 500);
      });
    }
  
    static validateJurisdiction(pathwayId, province) {
      const validCombinations = {
        divorce: ['ontario', 'british columbia'],
        childSupport: ['ontario', 'alberta']
      };
      return validCombinations[pathwayId]?.includes(province.toLowerCase());
    }
  }