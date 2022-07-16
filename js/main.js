var db = {
  foo: undefined,
  state: {
    wallets: {
      related: [],
    },
    network: {
    },
  }
}

const getState = () => { return db.state };
const networkChanged = () => { };
const accountChanged = () => { };

const getHistory = async (address) => {
  return fetch('http://api.etherscan.io/api?module=account&action=txlist&address='+address+'&startblock=0&endblock=inf&sort=asc')
    .then((r) => r.json()).then((data) => {
      db.state.wallets = {};
      db.state.wallets[address] = { 'history': data }

      let from = new Set(Object.values(db.state.wallets)[0].history.result.filter((tx) => { return tx.functionName.toString()=="" }).map((tx) => { 
        return web3.utils.toChecksumAddress(tx.from);
      }))
      let to = new Set(Object.values(db.state.wallets)[0].history.result.filter((tx) => { return tx.functionName.toString()=="" }).map((tx) => { 
        return web3.utils.toChecksumAddress(tx.to );
      }))

      db.state.wallets.related = [...from].filter((x) => to.has(x));
      if (db.state.wallets.related.indexOf(getState().network.account) < 0) {
        db.state.wallets.related.push(getState().network.account);
      }
    });
}

const init = async () => {
  loadBinds();
  tryConnecting(()=>{
    accountChanged();
    getHistory(getState().network.account);
  }, networkChanged, getState);
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
