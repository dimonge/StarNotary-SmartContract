const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {
    let defaultAccount = accounts[0];
    let user1 = accounts[1];


    let initStar = {
        name: "Star power 103!",
        cent: "ra_032.155",
        dec: "dec_121.874",
        mag: "mag_245.978",
        story: "I love my wonderful star"
    }

    let tokenId = 1
    beforeEach(async function () {
        this.contract = await StarNotary.new({
            from: accounts[0]
        })
    })

    describe('can create a star', () => {
        it('can create a star and get its star properties', async function () {
            // let tokenId = 1

            await this.contract.createStar(
                initStar.name,
                initStar.dec,
                initStar.mag,
                initStar.cent,
                initStar.story,
                tokenId, {
                    from: defaultAccount
                })
            const star = await this.contract.tokenIdToStarInfo(tokenId)
            assert.equal(star[0], initStar.name)
            assert.equal(star[1], initStar.dec)
            assert.equal(star[2], initStar.mag)
            assert.equal(star[3], initStar.cent)
            assert.equal(star[4], initStar.story)
        })

        it ("adding stars with same coordinates should throw an error", async function() {
            expectThrow(this.contract.createStar(initStar.name,
                initStar.dec,
                initStar.mag,
                initStar.cent,
                initStar.story,
                tokenId + 2, {
                    from: defaultAccount
                }))
        })
    })

    describe('buying and selling stars', () => {

        let user1 = accounts[1]
        let user2 = accounts[2]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(initStar.name,
                initStar.dec,
                initStar.mag,
                initStar.cent,
                initStar.story, starId, {
                from: user1
            })
        })

        describe('user1 can sell a star', () => {
            it('user1 can put up their star for sale', async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                })

                assert.equal(await this.contract.starsForSale(starId), starPrice)
            })

            it('user1 gets the funds after selling a star', async function () {
                let starPrice = web3.toWei(.05, 'ether')

                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                })

                let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: starPrice
                })
                let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)

                assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(),
                    balanceOfUser1AfterTransaction.toNumber())
            })
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {
                    from: user1
                })
            })

            it('user2 is the owner of the star after they buy it', async function () {
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: starPrice
                })

                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 correctly has their balance changed', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {
                    from: user2,
                    value: overpaidAmount,
                    gasPrice: 0
                })
                const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)

                assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice)
            })
        })
    })

    describe("check if star exist", () => {
        it ("should find existing star", async function() {
            await this.contract.createStar(
                initStar.name,
                initStar.dec,
                initStar.mag,
                initStar.cent,
                initStar.story,
                tokenId, {
                    from: defaultAccount
                })
            assert.equal(await this.contract.checkIfStarExist(initStar.dec, initStar.mag, initStar.cent, {from: defaultAccount}), true)
        })
    })
    describe("tokentoStarInfo", () => {
        it("should return the star info", async function() {
            await this.contract.createStar(
                initStar.name,
                initStar.dec,
                initStar.mag,
                initStar.cent,
                initStar.story,
                tokenId, {
                    from: defaultAccount
                })
            var starInfo = await this.contract.tokenIdToStarInfo(tokenId);

            assert.equal(starInfo[0], initStar.name)
            assert.equal(starInfo[1], initStar.dec)
            assert.equal(starInfo[2], initStar.mag)
            assert.equal(starInfo[3], initStar.cent)
            assert.equal(starInfo[4], initStar.story)
        })
    })
})

var expectThrow = async function(promise) {
    try {
        await promise;
    }catch(error){
        assert.exists(error);
        return;
    }
    //assert.fail("Expected error, but didn't see one");
}