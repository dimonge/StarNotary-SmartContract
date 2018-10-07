import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import { Form, Text, TextArea, } from 'react-form';
console.log(window.web3)
const CONTRACT_ABI = require('./utils/contract.abi.json');
//const CONTRACT_ADDRESS = "0xcdce1863ea2ba3d94c2d4fcfc6d90b36112c6fa2";
const deploy_address = "0x67f26B1c2781401529beA2bd038257c6520610b6"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      loading: false, 
      ownerStars: null,
      currentStars: null
    }
    this.web3 = null;
    if (window.web3 !== 'undefined') {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"))
    }
    
    // test account
    //this.account = web3.eth.defaultAccount = web3.eth.accounts[0];
    this.StarNotary = null;
    this.starNotary = null;
  }
  
  componentWillMount () {
    if (this.web3 && this.web3.isConnected()) {
      console.log(this.web3)

      this.setState({isConnected: true})
    
      this.web3.eth.defaultAccount = this.web3.eth.accounts[4]
      this.StarNotary = this.web3.eth.contract(CONTRACT_ABI)
      this.starNotary = this.StarNotary.at(deploy_address);

    }
  }
  async loadingStars() {
    this.setState({
      loading: false, 
      ownerStars: await this.getStarOwnerForAccount(),
      currentStars: await this.getStars()
    })
  }
  componentDidMount() {
    this.loadingStars()
    console.log("stars", this.state.currentStars)
  }
  createStar({name, dec, mag, cent, story}, tokenId, account) {
    console.log(name, dec, mag, cent, story, tokenId, account)
    return new Promise((resolve, reject) => {
      this.starNotary.createStar(name, dec, mag, cent, story, tokenId, {from: account}, (error, result) => {
        if (error){
          console.log("error",error)
          reject(error)
        } 
        else {
          console.log("result",result)
          resolve(result);
        }
      })
    })
  }
  putStarUpForSale(id, price, account) {
    return new Promise((resolve, reject) => {
      this.starNotary.putStarUpForSale(id, this.web3.toWei(price), {from: account}, (error, result) => {
        if (error) {
          reject(error);
        }else {
          resolve(error);
        }
      })
    })
  }
  tokenIdToStarInfo(tokenId) {
    return new Promise((resolve, reject) => {
      this.starNotary.tokenIdToStarInfo(tokenId, (error, result) => {
        if (error) {
          reject(error)
        }else {
          resolve(result)
        }
      })
    })
  }
  starsForSale (tokenId) {
    return new Promise((resolve, reject) => {
      this.starNotary.starsForSale(tokenId, (error, result) => {
        if (error) {reject(error)}
        else {resolve(result)}
      })
    })
  }
  getStarsInfo(value = {}, filter={ fromBlock: 0, toBlock: "latest"}) {
    return new Promise((resolve, reject) => {
      try {
        let starEvent = this.starNotary.Transfer(value, filter)
        console.log(starEvent)
        starEvent.get(async (error, events) => {
          console.log(error, events)
          if (error){ 
            reject(error);
          }else {
            let idsAdded = {}
            let stars = []
            events = events.reverse()

            for (let event of events) {
              let _tokenId = Number(event.args._tokenId)
              if (idsAdded[_tokenId]) continue;
              let star = await this.tokenIdToStarInfo(_tokenId)
              //let starPrice = await this.starsForSale(_tokenId)
              let starOwner = await this.ownerOf(_tokenId)
              console.log("xxxxxxxx")
              stars.push({
                star, 
                id: _tokenId, 
                //price: Number(this.web3.fromWei(starPrice, "ether")), 
                owner: starOwner
              })
              idsAdded[_tokenId] = true;
            }
            console.log("stars", stars)
            console.log("stars total", stars.length)
            resolve(stars)
          }
        })
      }catch(error) {
        reject("Transfer events failed to load. Here is the error" + error)
      }
    })
  }
  handleSubmit = (submittedValues) => {
    console.log(this.web3.eth.accounts)    
    this.createStar(submittedValues, Date.now(), this.web3.eth.accounts[0]).then((error, result) => {
      console.log("createStar", error, result)
      if (!error) {
        console.log(result)
        return;
      }
      console.error("something went wrong when creating a star", error)
    })
   // console.log(submittedValues)
   // this.setState({ submittedValues })
  }
  async getStarOwnerForAccount() {
    let account = this.web3.eth.accounts[4];
    let stars = await this.getStarsInfo({_to: account})
    return stars.filter(({owner}) => {
      return owner === account;
    })
  }
  getStars() {
    return this.getStarsInfo();
  }
  ownerOf(tokenId) {
    return new Promise((resolve, reject) => {
      this.starNotary.ownerOf(tokenId, (error, result) => {
        if(error) {
          reject(error)
        }
        else {
          //console.log(error, result)
          resolve(result)
        }
      })
    })
  }
  getTransactionReceipt(hash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransactionReceipt(hash, (error, result) => {
        if (error) reject(error)
        else {resolve(result)}
      })
    })
  }
  handleStarCreated(callback) {
    this.starNotary.Transfer(null, {address: this.web3.eth.accounts[4]}, callback)
  }
  async sellStar(star, price) {
    //e.preventDefault();
    const transactionReceipt = await this.putStarUpForSale(star.id, price, this.web3.eth.accounts[0]);
    this.getTransactionReceipt(transactionReceipt)
  }
  handleSellStar = (star, price) => {
    this.sellStar(star, price)
  }
  render() {
    return (
      <div className="App">
       <h2>It's connected</h2>
       {this.state.isConnected ? 'Connected to local node' : "Not connected"}
      <h3>Add a new star</h3>
       <Form onSubmit={this.handleSubmit}>
        {formApi => (
          <form onSubmit={formApi.submitForm} id="form2">
            <div>
              <label htmlFor="name">name</label>
              <Text field="name" id="name" />
            </div>
          <div>

            <label htmlFor="dec">Dec</label>
            <Text field="dec" id="dec" />
          </div>
          <div>
            <label htmlFor="mag">Mag</label>
            <Text field="mag" id="mag" />      
          </div>  
          <div>
            <label htmlFor="cent">Cent</label>
            <Text field="cent" id="cent" />
          </div>
          <div>
            <label htmlFor="story">Story</label>
            <TextArea field="story" id="story" />
          </div>
            <button type="submit" className="mb-4 btn btn-primary">Submit</button>
          </form>
        )}
      </Form>
      <h4>List the stars</h4>
        {this.state.loading ? <div>Loading stars</div> : <div> {
          
          this.state.currentStars && this.state.currentStars.map((result, index) => {
            return <div key={index}>
            <span>Star name: </span>{result.star[0]}
            <Form onSubmit={(value) => this.handleSellStar(result, value.price)}>
              {formApi => (
                <form onSubmit={formApi.submitForm} id="form2">
                  <div>
                    How much do you want to sell your star?
                  </div>
                   
                <div>
                  <label htmlFor="price">Price (in ethers e.g .002)</label>
                  <Text field="price" id="price" />
                </div>
                  <button type="submit" className="mb-4 btn btn-primary">Submit</button>
                </form>
              )}
            </Form>
            </div>
          })
        }</div>}
      </div>
    );
  }
}

export default App;
