pragma solidity >=0.4.22 <0.8.0;

contract Adoption {
    // This is an array of Ethereum addresses. In this case the type is address and the length is 16
    // Public variables have automatic getter methods, but in the case of arrays a key is required and will only return a single value.
    address[16] public adopters;

    // Adopting a pet
    function adopt(uint256 petId) public returns (uint256) {
        // In this case we'll be taking in a petId (integer) and returning an integer.
        require(petId >= 0 && petId <= 15);

        // If the ID is in range, we then add the address of the person or smart contract who called this function, msg.sender
        adopters[petId] = msg.sender;

        // We return the petId provided as a confirmation
        return petId;
    }

    // Retrieving the adopters
    // The view keyword in the function declaration means that the function will not modify the state of the contract.
    // Be sure to specify the return type (in this case, the type for adopters) as address[16] memory.
    // Memory gives the data location for the variable.
    function getAdopters() public view returns (address[16] memory) {
        // Since adopters is already declared, we can simply return it.
        return adopters;
    }
}
