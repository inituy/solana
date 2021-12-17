module.exports = async function awaitTransactionSignatureConfirmation(
  txid,
  timeout,
  connection,
  commitment,
  queryStatus,
) {
  let done = false;
  let status = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  // eslint-disable-next-line no-async-promise-executor
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log('Rejecting for timeout...');
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            console.log('Rejected via websocket', result.err);
            reject(status);
          } else {
            console.log('Resolved via websocket', result);
            resolve(status);
          }
        },
        commitment,
      );
    } catch (e) {
      done = true;
      console.log('WS error in setup', txid, e);
    }
    // while (!done && queryStatus) {
    //   // eslint-disable-next-line no-loop-func
    //   (async () => {
    //     try {
    //       const signatureStatuses = await connection.getSignatureStatuses([
    //         txid,
    //       ]);
    //       status = signatureStatuses && signatureStatuses.value[0];
    //       if (!done) {
    //         if (!status) {
    //           console.log('REST null result for', txid, status);
    //         } else if (status.err) {
    //           console.log('REST error for', txid, status);
    //           done = true;
    //           reject(status.err);
    //         } else if (!status.confirmations) {
    //           console.log('REST no confirmations for', txid, status);
    //         } else {
    //           console.log('REST confirmation for', txid, status);
    //           done = true;
    //           resolve(status);
    //         }
    //       }
    //     } catch (e) {
    //       if (!done) {
    //         console.log('REST connection error: txid', txid, e);
    //       }
    //     }
    //   })();
    //   await setTimeout(function () {
    //     console.log("Waiting...");
    //   },200000);
    // }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId);
  done = true;
  console.log('Returning status', status);
  return status;
}