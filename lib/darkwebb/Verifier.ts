import { ethers } from "ethers";
import { Verifier__factory } from '../../typechain/factories/Verifier__factory';
import { Verifier2__factory } from '../../typechain/factories/Verifier2__factory';
import { Verifier3__factory } from '../../typechain/factories/Verifier3__factory';
import { Verifier4__factory } from '../../typechain/factories/Verifier4__factory';
import { Verifier5__factory } from '../../typechain/factories/Verifier5__factory';
import { Verifier6__factory } from '../../typechain/factories/Verifier6__factory';
import { Verifier as VerifierContract} from '../../typechain/Verifier';

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains all verifiers)
class Verifier {
  signer: ethers.Signer;
  contract: VerifierContract;

  private constructor(
    contract: VerifierContract,
    signer: ethers.Signer,
  ) {
    this.signer = signer;
    this.contract = contract;
  }

  // Deploys a Verifier contract and all auxiliary verifiers used by this verifier
  public static async createVerifier(
    signer: ethers.Signer,
  ) {
    const v2Factory = new Verifier2__factory(signer);
    const v2 = await v2Factory.deploy(); 
    const v3Factory = new Verifier3__factory(signer);
    const v3 = await v3Factory.deploy(); 
    const v4Factory = new Verifier4__factory(signer);
    const v4 = await v4Factory.deploy(); 
    const v5Factory = new Verifier5__factory(signer);
    const v5 = await v5Factory.deploy(); 
    const v6Factory = new Verifier6__factory(signer);
    const v6 = await v6Factory.deploy(); 

    const factory = new Verifier__factory(signer);
    const verifier = await factory.deploy(
      v2.address,
      v3.address,
      v4.address,
      v5.address,
      v6.address,
    );
    await verifier.deployed();
    const createdVerifier = new Verifier(verifier, signer);
    return createdVerifier;
  }
}

export default Verifier;
