let web3;
let duplicateTransactions = new Map();

const setWeb3 = (_web3) => {
  web3 = _web3;
}

const getBalance = (address) => {
  return new Promise(function(resolve, reject) {
    web3.eth.getBalance(address, function(error, result) {
      if(error) reject(error)
      else resolve(web3.utils.fromWei(result, 'ether'))
    })
  })
}

const getBlockNumber = () => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, blockNumber) => {
      if(err) reject(err)
      resolve(blockNumber);
    });
  });
}

const sendTransaction = (options) => {
  return new Promise((resolve, reject) => {
    web3.eth.sendTransaction(options, (err, res) => {
      if(err) reject(err)
      else resolve(res)
    })
  })
}

const getNetworkId = () => {
  return new Promise((resolve, reject) => {
    web3.eth.net.getId((err, netId) => {
      if(err) reject();
      else resolve(netId);
    });
  });
}

const toWei = (ether) => {
  return web3.utils.toWei(ether, 'ether')
}

const fromWei = (wei) => {
  return web3.utils.fromWei(wei, 'ether')
}

const watchAccountChanges = (callback, lastKnownAccount) => {
  let interval = setInterval(function() {
    web3.eth.getAccounts(function (error, accounts) {
      if(error) return console.log(error)
      const newAccount = accounts[0]
      if(newAccount !== lastKnownAccount) {
        callback(newAccount)
        clearInterval(interval)
        watchAccountChanges(callback, newAccount);
      }
    })
  }, 1000)
}

const watchNetwork = (callbacks) => {

  // Gas price
  if(callbacks.gasPrice) {
    const gasPrice = function() {
      web3.eth.getGasPrice(function(error, result) {
        if(error) return console.log(error)
        callbacks.gasPrice(result)
      })
    }
    gasPrice()
    setInterval(gasPrice, 30 * 60000)
  }

  // Network id
  if(callbacks.networkId) {
    const netId = function() {
      web3.eth.net.getId(function(error, result) {
        if(error) return console.log(error)
        callbacks.networkId(result)
      })
    }
    netId()
    setInterval(netId, 5 * 1000)
  }

  // Block num
  if(callbacks.blockNum) {
    const blockNum = function() {
      web3.eth.getBlockNumber((err, blockNumber) => {
        if(err) console.log(err)
        callbacks.blockNum(blockNumber);
      });
    }
    blockNum()
    setInterval(blockNum, 10 * 1000)
  }

}

const validateAddress = (address) => {
  if(!address) return false;
  if(address === '0x0000000000000000000000000000000000000000') return false;
  if(address.substring(0, 2) !== "0x") return false;

  // Basic validation: length, valid characters, etc
  if(!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false;

  // Checksum validation.
  const raw = address.replace('0x','');
  const allLowerCase = raw.toLowerCase() === raw;
  const allUppercase = raw.toUpperCase() === raw;
  if(allLowerCase || allUppercase) {
    return true; // accepts addreses with no checksum data
  }
  else {
    const checksum = ethjs.toChecksumAddress(address);
    if(address !== checksum) return false;
  }

  return true;
}

const addressHasChecksum = (address) => {
  if(!module.exports.isValidAddress(address)) return false;
  const raw = address.replace('0x','');
  const allLowerCase = raw.toLowerCase() === raw;
  const allUppercase = raw.toUpperCase() === raw;
  return !(allLowerCase || allUppercase);
}

const verifySignature = (json) => {
  try {
    const messageHash = ethjs.hashPersonalMessage(ethjs.toBuffer(json.msg));
    const signedMessageDecoded = ethjs.fromRpcSig(json.sig);
    const recoveredPublicKey = ethjs.ecrecover(messageHash, signedMessageDecoded.v, signedMessageDecoded.r, signedMessageDecoded.s);
    const recoveredAddressBuffer = ethjs.pubToAddress(recoveredPublicKey);
    const recoveredAddress = ethjs.bufferToHex(recoveredAddressBuffer);
    return json.address === recoveredAddress;
  }
  catch(err) {
    return false;
  }
}

const signMessageWithMetamask = (addr, message, callback) => {
  const msg = ethjs.bufferToHex(new Buffer(message, 'utf8'));
  web3.currentProvider.sendAsync({
    method: 'personal_sign',
    params: [msg, addr],
    addr
  }, function(err, res) {
    callback({
      address: addr,
      msg: message,
      sig: res.result,
      version: '2'
    });
  });
}
