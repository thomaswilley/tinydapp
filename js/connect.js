const tryConnecting = async(accountChanged, networkChanged, getState) => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
      await window.ethereum.request({method: `eth_requestAccounts`})
    } catch (error) {
      console.error(error)
      console.error(`Refresh the page to approve/reject again`)
      window.web3 = null
    }
  }
  if(window.web3) {
    setWeb3(window.web3)
    await web3.eth.getAccounts(function (error, accounts) {
      let user;
      if(accounts.length !== 0 && !error) account = accounts[0]

      watchAccountChanges(account => {
        getState().network.account = account;
        accountChanged();
        delete(account)
      }, user);
      watchNetwork({
        networkId: id => {
          if (id !== getState().network.networkId) {
            getState().network.networkId = id;
          }
          networkChanged();
        },
        blockNum: num => {
          if(num !== getState().network.blockNum) {
            getState().network.blockNum = num;
            window.web3.eth.getBlock(num, (err,blk) => {
              getState().network.baseFee = blk.baseFeePerGas;
              getState().network.maxPriorityFee = 1;
              getState().network.gasLimit = Math.floor(blk.gasLimit * 0.75);
            });
          }
        }
      });
    });
  }
}
