module.exports = async function simulateTransaction(
  connection,
  transaction,
  commitment,
) {
  transaction.recentBlockhash = await connection._recentBlockhash(
    connection._disableBlockhashCaching,
  );

  const signData = transaction.serializeMessage();
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString('base64');
  const config = { encoding: 'base64', commitment };
  const args = [encodedTransaction, config];

  const res = await connection._rpcRequest('simulateTransaction', args);
  console.log("RES ", res.result.value.err);
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message);
  }
  return res.result;
}