var anchor = require('@project-serum/anchor');

module.exports = function (params) {
  var provider = new anchor.Provider(params.connection, params.payer, {
    preflightCommitment: 'recent'
  })
  return Promise.resolve()
    .then(function () {
      return anchor.Program.fetchIdl('cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ', provider)
    })
    .then(function (idl) {
      // console.log(new Date(), 'Candy machine IDL:', idl);
      return new anchor.Program(idl, 'cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ', provider);
    })
};
