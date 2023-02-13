App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-adopt").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache (create our web3 object based on our local provider)
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Adoption.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
  },

  markAdopted: function () {
    // e first declare the variable adoptionInstance outside so we can access the instance after initially retrieving it
    var adoptionInstance;

    // We access the deployed Adoption contract, then call getAdopters()
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;
        // call() read data from the blockchain without having to send a full transaction, so you don't have to spend any ether
        return adoptionInstance.getAdopters.call();
      })
      .then(function (adopters) {
        // After calling getAdopters(), we then loop through all of them, checking to see if an address is stored for each pet.
        // Since the array contains address types, Ethereum initializes the array with 16 empty addresses.
        // This is why we check for an empty address string rather than null or other falsey value
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".panel-pet")
              .eq(i)
              .find("button")
              .text("Adopted 🎉")
              .attr("disabled", true);
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));
    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      // In the callback after an error check, we then select the first account
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          // we get the deployed contract as we did above and store the instance in adoptionInstance
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          // The gas cost is the fee for performing computation and/or storing data in a smart contract
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
