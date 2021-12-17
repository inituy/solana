const awaitTransactionSignatureConfirmation = require('./await_transaction_signature_confirmation');
const solana = require('@solana/web3.js')
const simulateTransaction = require('./simulate_transaction');

module.exports = async function sendSignedTransaction(
  connection,
  signedTransaction,
  timeout = 15000,
) {
  const rawTransaction = signedTransaction.serialize();
  function getUnixTs() {
    return new Date().getTime / 1000
  }
  const startTime = getUnixTs()
  let slot = 0;
  const txid = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    },
  );

  console.log('Started awaiting confirmation for', txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(500);
    }
  })();
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      'confirmed',
      true,
    );
    if (!confirmation)
      throw new Error('Timed out awaiting confirmation on transaction');
    if (confirmation.err) {
      console.log(confirmation.err);
      throw new Error('Transaction failed: Custom instruction error');
    }

    slot = confirmation?.slot || 0;
    console.log("SLOT", slot);
  } catch (err) {
    console.log('Timeout Error caught', err);
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction');
    }
    let simulateResult = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, 'single')
      ).value;
    } catch (e) {
      console.log('Simulate Transaction error', e);
    }
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line.startsWith('Program log: ')) {
            throw new Error(
              'Transaction failed: ' + line.slice('Program log: '.length),
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err));
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true;
  }

  console.log('Latency (ms)', txid, getUnixTs() - startTime);
  return { txid, slot };
}