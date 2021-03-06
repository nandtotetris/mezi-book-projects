module.exports = {
  data: {
    invoice: {
      id: '1173',
      status: null,
      filename: '82_41.pdf',
      filepath: "invoice.jpg",
      importAt: 1552983103747,
      number: 'qsdf',
      currency: 'EUR',
      total: 82.41,
      totalWoT: 75,
      dueDate: 1552953600000,
      invoiceDate: 1551398400000,
      receiverTitle: null,
      emitterTitle: null,
      enabled: true,
      error: false,
      ocrStatus: 'ok',
      ocrPartner: 'jenji',
      ocrFeedback: {},
      estimatedBalance: null,
      paymentAt: 1559846771333,
      ocrSirenFeedback: {
        siren: '423190792',
        siret: '42319079200030',
        name: 'C N E R - CONSEIL ET NEGOCE EUROPEEN EN RESTAURATION',
        slogan: 'slogan',
        domainName: 'http://test.com',
        naf: '46.17B',
        nafNorm: 'NAFRev2',
        brandName: null,
        numberEmployees: '11',
        legalForm: '5499',
        category: 'PME',
        incorporationAt: '2014-09-01T00:00:00.000Z',
        vatNumber: 'FR13423190792',
        addresses: {
          total: 1,
          rows: [
            {
              siret: '42319079200030',
              address1: '30 AV DE NORMANDIE',
              address2: null,
              zipcode: '94150',
              city: 'RUNGIS',
              country: 'France'
            }
          ]
        }
      },
      createdAt: 1552983103624,
      updatedAt: 1552992849639,
      __typename: 'Invoice',
      importedBy: {
        id: '56',
        firstname: 'nico',
        lastname: 'labbe',
        email: 'nicolas.labbe+1@test.fr',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
        lastLogin: 1551168330661,
        lastCguAccept: 1551168330661,
        createdAt: 1551168330787,
        updatedAt: 1552992755937,
        __typename: 'User',
        companies: require('./companies.js').data.companies
      },
      createdBy: null,
      companyEmitter: require('./company.js').data.company,
      companyReceiver: require('./company.js').data.company,
      iban: {
        id: '131',
        iban: 'FR7630004025110001109429668',
        result: 'passed',
        returnCode: 0,
        bic: 'BOFIIE2DXXX',
        bicCondidates: null,
        country: 'IE',
        bankCode: '900017',
        bank: 'Bank of Ireland',
        bankAddress: 'c/o 2 College Green\nDublin 2 ',
        branch: '',
        branchCode: '',
        inSclDirectory: 'yes',
        sct: 'yes',
        sdd: 'yes',
        cor1: 'no',
        treezorBeneficiaryId: 7228,
        b2b: 'no',
        scc: 'no',
        jsonIbanBic: {
          iban: 'IE92BOFI90001710027952',
          result: 'passed',
          returnCode: 0,
          checks: ['length', 'bank_code', 'account_number', 'iban_checksum'],
          bicCandidates: [
            {
              bic: 'BOFIIE2DXXX',
              zip: '',
              city: '',
              wwwcount: 0,
              sampleurl: ''
            }
          ],
          allBicCandidates: [
            {
              bic: 'BOFIIE2DXXX',
              zip: '',
              city: '',
              wwwcount: 0,
              sampleurl: ''
            }
          ],
          country: 'IE',
          bankCode: '900017',
          bankAndBranchCode: '900017',
          bank: 'Bank of Ireland',
          bankAddress: 'c/o 2 College Green\nDublin 2 ',
          bankStreet: 'c/o 2 College Green',
          bankCity: 'Dublin',
          bankState: '',
          bankPostalCode: '2',
          bankUrl: '',
          branch: '',
          branchCode: '',
          inSclDirectory: 'yes',
          sct: 'yes',
          sdd: 'yes',
          cor1: 'no',
          b2b: 'no',
          scc: 'no',
          sctInst: '',
          sctInstReadinessDate: '',
          accountNumber: '10027952',
          accountValidationMethod: '',
          accountValidation: '',
          lengthCheck: 'passed',
          accountCheck: 'passed',
          bankCodeCheck: 'passed',
          ibanChecksumCheck: 'passed',
          dataAge: '20160210',
          ibanListed: '',
          ibanWwwOccurrences: '0',
          wwwSeenFrom: '2016-06-20',
          wwwSeenUntil: '2016-10-31',
          ibanUrl:
            'http://www.tcd.ie/financial-services/research/res_internal/res_bank&tax.php',
          urlRank: '21473',
          urlCategory: 'Libraries/Research',
          urlMinDepth: '3',
          wwwProminence: '',
          ibanReportedToExist: 0,
          ibanLastReported: '',
          ibanCandidate: '',
          IBANformat: 'IEkk AAAA BBBB BBCC CCCC CC',
          formatcomment:
            'The first 4 alphanumeric characters are the start of the SWIFT code. Then a 6 digit long routing code and an 8 digit account code follow, both numeric.',
          balance: 9999,
          bic: 'BOFIIE2DXXX',
          readerCompany: {
            status: 'UNKNOWN',
            source: 'original',
            id: 826,
            siren: '529849275',
            siret: '52984927500068',
            name: 'TEST',
            brandName: null,
            vatNumber: 'FR10529849275',
            naf: '62.01Z',
            nafNorm: 'NAFRev2',
            numberEmployees: null,
            incorporationAt: '2016-12-30T00:00:00.000Z',
            legalForm: '5498',
            treezorEmail:
              'payment.467ee164-4363-4d43-9e5d-69144a37b332@libeo.io',
            treezorUserId: 699709,
            treezorWalletId: 153892,
            treezorIban: 'FR7616798000010000015389268',
            treezorBic: 'TRZOFR21XXX',
            category: 'PME',
            kycStatus: null,
            kycStep: 'IBAN',
            capital: null,
            legalAnnualTurnOver: '250-999',
            legalNetIncomeRange: '10-49',
            phone: null,
            signature: { userId: 56, signedAt: '2019-03-19T08:41:54.940Z' },
            createdAt: '2019-03-19T08:03:57.020Z',
            updatedAt: '2019-03-19T08:41:55.051Z'
          },
          company: {
            status: 'UNKNOWN',
            source: 'original',
            id: 827,
            siren: '423190792',
            siret: '42319079200030',
            name: 'C N E R - CONSEIL ET NEGOCE EUROPEEN EN RESTAURATION',
            slogan: 'slogan',
            domainName: 'http://test.com',
            brandName: null,
            vatNumber: 'FR13423190792',
            naf: '46.17B',
            nafNorm: 'NAFRev2',
            numberEmployees: '11',
            incorporationAt: '2014-09-01T00:00:00.000Z',
            legalForm: '5499',
            treezorEmail: null,
            treezorUserId: null,
            treezorWalletId: null,
            treezorIban: null,
            treezorBic: null,
            category: 'PME',
            kycStatus: null,
            kycStep: null,
            capital: null,
            legalAnnualTurnOver: null,
            legalNetIncomeRange: null,
            phone: null,
            signature: null,
            createdAt: '2019-03-19T08:42:05.183Z',
            updatedAt: '2019-03-19T08:42:05.183Z'
          }
        },
        createdAt: 1552984925890,
        readerCompany: null,
        createdBy: null,
        company: null,
        __typename: 'Iban'
      },
      history: {
        total: 9,
        rows: [
          {
            id: '2885',
            event: 'UPDATE_STATUS',
            params: { status: 'IMPORTED', oldStatus: 'IMPORTING' },
            createdAt: 1552983103980,
            updatedAt: 1552983103980,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2886',
            event: 'UPDATE_STATUS',
            params: { status: 'SCANNING', oldStatus: 'IMPORTED' },
            createdAt: 1552983104014,
            updatedAt: 1552983104014,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2887',
            event: 'UPDATE_STATUS',
            params: { status: 'SCANNED', oldStatus: 'SCANNING' },
            createdAt: 1552983106299,
            updatedAt: 1552983106299,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2888',
            event: 'UPDATE_STATUS',
            params: { status: 'TO_PAY', oldStatus: 'SCANNED' },
            createdAt: 1552984925641,
            updatedAt: 1552984925641,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2890',
            event: 'UPDATE_STATUS',
            params: { status: 'PLANNED', oldStatus: 'TO_PAY' },
            createdAt: 1552985073252,
            updatedAt: 1552985073252,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2891',
            event: 'UPDATE_STATUS',
            params: { status: 'TO_PAY', oldStatus: 'PLANNED' },
            createdAt: 1552985156316,
            updatedAt: 1552985156316,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2894',
            event: 'UPDATE_STATUS',
            params: { status: 'PLANNED', oldStatus: 'TO_PAY' },
            createdAt: 1552985164946,
            updatedAt: 1552985164946,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2895',
            event: 'UPDATE_STATUS',
            params: { status: 'TO_PAY', oldStatus: 'PLANNED' },
            createdAt: 1552992847154,
            updatedAt: 1552992847154,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          },
          {
            id: '2897',
            event: 'UPDATE_STATUS',
            params: { status: 'SCANNED', oldStatus: 'TO_PAY' },
            createdAt: 1552992849648,
            updatedAt: 1552992849648,
            __typename: 'History',
            user: {
              id: '56',
              firstname: 'nico',
              lastname: 'labbe',
              email: 'nicolas.labbe+1@test.fr',
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5pY29sYXMubGFiYmUrMUBhZGZhYi5mciIsImlhdCI6MTU1Mjk5Mjc1NSwiZXhwIjoxNTUyOTk2MzU1fQ.vRyaWUqIQTTlCAL4YWjLc8VakjC-XI69EymHqN4Jp50',
              lastLogin: 1551168330661,
              lastCguAccept: 1551168330661,
              createdAt: 1551168330787,
              updatedAt: 1552992755937,
              __typename: 'User',
              companies: require('./companies.js').data.companies
            }
          }
        ],
        __typename: 'Histories'
      },
      purchaseAccount: {
        createdAt: 1555080221404,
        description: "",
        enabled: true,
        id: "78c61a1a-4b53-4a0e-a84a-49b9dd2f3320",
        key: "test",
        order: 0,
        type: "PURCHASE_ACCOUNT",
        updatedAt: 1555080222768,
        value: "test",
        __typename: "AccountingPreference"
      }
    }
  }
};
