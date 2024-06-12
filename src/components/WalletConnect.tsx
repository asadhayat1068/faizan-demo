import React, { useState } from 'react';
import { ethers } from 'ethers';
import Modal from 'react-modal';
import detectEthereumProvider from '@metamask/detect-provider';
import walletimg from '../asserts/images/connect-wallet.svg';
import logo from '../asserts/images/logo.svg';
import mmlogo from '../asserts/images/MetaMask.png';
Modal.setAppElement('#root');

const WalletConnect: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const connectMetaMask = async () => {
    const ethereumProvider: any = await detectEthereumProvider();
    if (ethereumProvider) {
      try {
        await ethereumProvider.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(ethereumProvider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setProvider(web3Provider);
        setModalIsOpen(false); // Close the modal
      } catch (error) {
        console.error("User rejected the request:", error);
      }
    } else {
      console.error("No Ethereum provider found. Install MetaMask!");
    }
  };

  return (
    <div>
      {account ? (
        <div>
          <p>Connected account: {account}</p>
        </div>
      ) : (
        
        <img onClick={() => setModalIsOpen(true)} src={walletimg} alt="Logo" className="w-44 h-8 clogo" />
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Connect Wallet"
        className="modal"
        overlayClassName="overlay"
      >
       <img src={logo} alt="Logo" className="w-44 h-8 center-image" />
       <div className="modal-content">
          
          <h2>Connect to a Wallet</h2>
          <button onClick={connectMetaMask} className="wallet-button">
            <img src={mmlogo}/>
            Connect with MetaMask
          </button>
         
          <div className="close-button" onClick={() => setModalIsOpen(false)}>
            <span className="close-icon">x</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WalletConnect;
