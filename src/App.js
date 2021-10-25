import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import ZengoLogo from './assets/zengo_logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isMobile } from 'react-device-detect';
import './App.css';
import { Col, Container, Row } from 'react-bootstrap';
import MetaTags from 'react-meta-tags';

function App() {
  const [keyNum, setKeyNum] = useState(1);
  const [keyProbabilityTable, setKeyProbabilityTable] = useState({
    safe: [0.7],
    leaked: [0.05],
    lost: [0.15],
    stolen: [0.1]
  });
  const [keyProbabilitiesUpdatedTable, setKeyProbabilitiesUpdatedTable] = useState({});
  const [wallet, setWallet] = useState([]);
  const keyStates = ['safe', 'leaked', 'lost', 'stolen'];
  const floatingPrecision = 8;
  const [combinationToAdd, setCombinationToAdd] = useState([]);
  const [isEditingProbabilities, setIsEditingProbabilities] = useState(false);
  let curOptimalWallet = [];
  let maxSuccessForWallet = 0;
  const [optimalWallet, setOptimalWallet] = useState([]);
  const [optimalWalletProb, setOptimalWalletProb] = useState(0);
  const [showProbabilitiesError, setShowProbabilitiesError] = useState(false);
  const [showWalletStrWithErrors, setShowWalletStrWithErrors] = useState(false);
  const [showCantComputeOptimalWallet, setShowCantComputeOptimalWallet] = useState(false);
  const [showWalletReduced, setShowWalletReduced] = useState(false);
  const [showSetKeysInfo, setShowSetKeysInfo] = useState(true);
  const [showWalletConfigurationInfo, setShowWalletConfigurationInfo] = useState(true);
  const [showWalletInfo, setShowWalletInfo] = useState(true);
  const [showWarningMobile, setShowWarningMobile] = useState(isMobile);
  const marginHorizontalPx = isMobile ? '5px' : '100px';
  const minusButtonBottomMarginPx = isMobile ? '2px' : '0px';
  const copyKeyMarginLeftPx = isMobile ? '0px' : '10px';

  function renderTableHeader() {
    let header = [" ", " "].concat(Object.keys(keyProbabilityTable));
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    });
  }

  function updateKeyProbabilities(state, index, percent) {
    keyProbabilitiesUpdatedTable[state][index] = percent / 100;
    setKeyProbabilitiesUpdatedTable(keyProbabilitiesUpdatedTable);
  }

  function toggleEditingMode() {
    if (isEditingProbabilities) {
      for (let i = 0; i < keyNum; i++) {
        if (parseFloat((keyProbabilitiesUpdatedTable.safe[i] + keyProbabilitiesUpdatedTable.leaked[i] + keyProbabilitiesUpdatedTable.lost[i] + keyProbabilitiesUpdatedTable.stolen[i]).toFixed(floatingPrecision)) !== 1) {
          setShowProbabilitiesError(true);
          return;
        }
      }
      setKeyProbabilityTable(keyProbabilitiesUpdatedTable);
      setOptimalWalletProb(0);
      setOptimalWallet([]);
      setShowProbabilitiesError(false);
    }
    else {
      setKeyProbabilitiesUpdatedTable(keyProbabilityTable);
    }

    setIsEditingProbabilities(!isEditingProbabilities);
  }

  function toPercent(probability) {
    return parseFloat((probability * 100).toFixed(floatingPrecision)).toString() + ' %';
  }

  function duplicateKey(index) {
    keyProbabilityTable.safe.push(keyProbabilityTable.safe[index]);
    keyProbabilityTable.leaked.push(keyProbabilityTable.leaked[index]);
    keyProbabilityTable.lost.push(keyProbabilityTable.lost[index]);
    keyProbabilityTable.stolen.push(keyProbabilityTable.stolen[index]);

    setKeyProbabilityTable(keyProbabilityTable);
    setKeyNum(keyNum + 1);
    setOptimalWalletProb(0);
    setOptimalWallet([]);
  }

  function removeKey(index) {
    if (keyNum === 1) {
      return;
    }
    for (const keyState in keyProbabilityTable) {
      if (Object.hasOwnProperty.call(keyProbabilityTable, keyState)) {
        keyProbabilityTable[keyState] = keyProbabilityTable[keyState].slice(0, index).concat(keyProbabilityTable[keyState].slice(index + 1, keyNum));
      }
    }
    setKeyProbabilityTable(keyProbabilityTable);
    setKeyNum(keyNum - 1);
    setWallet([]);
    setCombinationToAdd([]);
    setOptimalWalletProb(0);
    setOptimalWallet([]);
  }

  function addKey() {
    keyProbabilityTable.safe.push(keyProbabilityTable.safe[keyNum - 1]);
    keyProbabilityTable.leaked.push(keyProbabilityTable.leaked[keyNum - 1]);
    keyProbabilityTable.lost.push(keyProbabilityTable.lost[keyNum - 1]);
    keyProbabilityTable.stolen.push(keyProbabilityTable.stolen[keyNum - 1]);

    setKeyProbabilityTable(keyProbabilityTable);
    setKeyNum(keyNum + 1);
    setOptimalWalletProb(0);
    setOptimalWallet([]);
  }

  function renderKeyProbInputRow(index) {
    if (isEditingProbabilities) {
      return (
        <tr key={index} style={{ textAlign: 'center' }}>
          <td></td>
          <td>{index + 1}</td>
          <td><input type="number" defaultValue={keyProbabilityTable.safe[index] * 100} onChange={(event) => updateKeyProbabilities('safe', index, parseFloat(event.target.value))} /> %</td>
          <td><input type="number" defaultValue={keyProbabilityTable.leaked[index] * 100} onChange={(event) => updateKeyProbabilities('leaked', index, parseFloat(event.target.value))} /> %</td>
          <td><input type="number" defaultValue={keyProbabilityTable.lost[index] * 100} onChange={(event) => updateKeyProbabilities('lost', index, parseFloat(event.target.value))} /> %</td>
          <td><input type="number" defaultValue={keyProbabilityTable.stolen[index] * 100} onChange={(event) => updateKeyProbabilities('stolen', index, parseFloat(event.target.value))} /> %</td>
        </tr>
      );
    }
    else {
      return (
        <tr key={index} style={{ textAlign: 'center' }}>
          <td style={{ alignItems: 'center' }}><Button variant='minty' size='sm' style={{ marginBottom: minusButtonBottomMarginPx }} onClick={() => removeKey(index)}>-</Button><Button style={{ marginLeft: copyKeyMarginLeftPx }} size='sm' variant='minty' onClick={() => duplicateKey(index)}>copy</Button></td>
          <td>{index + 1}</td>
          <td>{toPercent(keyProbabilityTable.safe[index])}</td>
          <td>{toPercent(keyProbabilityTable.leaked[index])}</td>
          <td>{toPercent(keyProbabilityTable.lost[index])}</td>
          <td>{toPercent(keyProbabilityTable.stolen[index])}</td>
        </tr>
      );
    }
  }

  function ownerSuccessForScenarioAndWallet(walletArr, scenario) {
    for (let combination of walletArr) {
      let combinationPassed = true;
      for (let keyIndex of combination) {
        let keyState = keyStates[parseInt(scenario[keyIndex])];
        if (keyState === 'lost' || keyState === 'stolen') {
          combinationPassed = false;
          break;
        }
      }

      if (combinationPassed === true) {
        return true;
      }
    }
    return false;
  }

  function adversaryFailureForScenarioAndWallet(walletArr, scenario) {
    for (let combination of walletArr) {
      let combinationPassed = true;
      for (let keyIndex of combination) {
        let keyState = keyStates[parseInt(scenario[keyIndex])];
        if (keyState === 'lost' || keyState === 'safe') {
          combinationPassed = false;
          break;
        }
      }

      if (combinationPassed === true) {
        return false;
      }
    }
    return true;
  }

  function scenarioProbability(scenario) {
    let scenarioProb = 1;
    for (let i = 0; i < scenario.length; i++) {
      scenarioProb *= keyProbabilityTable[keyStates[parseInt(scenario[i])]][i];
    }
    return scenarioProb;
  }

  function computeProbabilityForWallet(walletArr) {
    let walletSuccessProb = 0;

    // Ahead lies some base 4 magic to enumerate all scenarios
    for (let i = 0; i < 4 ** keyNum; i++) {
      let scenario = i.toString(4);
      scenario = scenario.padStart(keyNum, '0');
      if (ownerSuccessForScenarioAndWallet(walletArr, scenario) && adversaryFailureForScenarioAndWallet(walletArr, scenario)) {
        walletSuccessProb += scenarioProbability(scenario);
      }
    }

    return walletSuccessProb;
  }

  function displayWallet(walletArr) {
    let walletString = "";
    if (walletArr.length === 0 || walletArr[0].length === 0) {
      return "( )";
    }
    for (let combination of walletArr) {
      walletString += " ( ";
      for (let keyIndex of combination) {
        walletString += (keyIndex + 1).toString() + " and ";
      }
      walletString = walletString.slice(0, -4);
      walletString += " ) ";
      walletString += " or ";
    }
    walletString = walletString.slice(0, -3);
    return walletString;
  }

  function combinationCoveredInWallet(wallet, newCombination) {
    for (let combination of wallet) {
      if (combination & newCombination === combination) {
        return true;
      }
    }

    return false;
  }

  function convertBinaryWalletToWallet(binWallet) {
    let wallet = [];
    for (let binComb of binWallet) {
      let combination = [];
      for (let i = 0; i < keyNum; i++) {
        if ((binComb & (1 << i)) > 0) {
          combination.push(i);
        }
      }
      if (combination.length > 0) {
        wallet.push(combination);
      }
    }

    return wallet;
  }

  function enumerateWalletProbabilities(baseWallet, prevCombination) {
    for (let curCombination = prevCombination + 1; curCombination < 2 ** keyNum; curCombination++) {
      if (!combinationCoveredInWallet(baseWallet, curCombination)) {
        let curWallet = [curCombination].concat(baseWallet);
        let convertedWallet = convertBinaryWalletToWallet(curWallet);
        let walletProb = computeProbabilityForWallet(convertedWallet);
        if (walletProb > maxSuccessForWallet) {
          maxSuccessForWallet = walletProb;
          curOptimalWallet = convertedWallet;
        }

        enumerateWalletProbabilities(curWallet, curCombination);
      }
    }
  }

  function findOptimalWallet() {
    if (keyNum > 4) {
      setShowCantComputeOptimalWallet(true);
      return;
    }

    // recursively enumerate all wallets 
    enumerateWalletProbabilities([], 0);
    setOptimalWallet(curOptimalWallet);
    setOptimalWalletProb(maxSuccessForWallet);
  }

  function parseWalletFromString(walletStr) {
    let lookForNumber = false;
    let lookForAnd = false;
    let lookForOr = false;
    let lookForCombinationStart = true;
    let lookForCombinationEnd = false;
    let newWallet = [];
    let combination = [];

    if (walletStr.length === 0) {
      setShowWalletStrWithErrors(false);
      setWallet([]);
    }

    // normalize entered string
    walletStr = walletStr
      .toLowerCase()
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .replace(/and/g, ' and ')
      .replace(/or/g, ' or ')
      .replace(/[\s]+/g, ' ')
      .trim();
    let walletTokens = walletStr.split(' ');

    for (let token of walletTokens) {
      if (lookForCombinationStart) {
        if (token !== "(") {
          setShowWalletStrWithErrors(true);
          return;
        }
        lookForNumber = true;
        lookForCombinationStart = false;
        continue;
      }
      if (lookForNumber) {
        try {
          let keyIndex = parseInt(token) - 1;
          if (keyIndex >= keyNum) {
            setShowWalletStrWithErrors(true);
            return;
          }
          combination.push(keyIndex);
          lookForNumber = false;
          lookForAnd = true;
          lookForCombinationEnd = true;
          continue;
        } catch {
          setShowWalletStrWithErrors(true);
          return;
        }
      }
      if (lookForAnd || lookForCombinationEnd) {
        if (token === 'and') {
          lookForNumber = true;
          lookForCombinationEnd = false;
          lookForAnd = false;
          continue;
        }
        else if (token === ')') {
          reduceWallet(newWallet, combination);
          combination = [];
          lookForCombinationEnd = false;
          lookForOr = true;
          lookForAnd = false;
          continue;
        }
        else {
          setShowWalletStrWithErrors(true);
          return;
        }
      }
      if (lookForOr) {
        if (token === 'or') {
          lookForCombinationStart = true;
          lookForOr = false;
        }
        else {
          setShowWalletStrWithErrors(true);
          return;
        }
      }
    }

    if (lookForOr) {
      setWallet(newWallet);
      setCombinationToAdd([]);
      setShowWalletStrWithErrors(false);
    }
    else {
      setShowWalletStrWithErrors(true);
    }
  }

  function addToCombination(keyToAdd) {
    const newCombinationToAdd = [...combinationToAdd, keyToAdd];
    setCombinationToAdd(newCombinationToAdd);
  }

  function reduceWallet(curWallet, combination) {
    if (combination.length === 0) {
      return;
    }
    let combinationReduced = false;
    for (let i = 0; i < curWallet.length; i++) {
      if (combination.every(elem => curWallet[i].includes(elem))) {
        curWallet[i] = combination;
        combinationReduced = true;
        setShowWalletReduced(true);
        break;
      }
      else if (curWallet[i].every(elem => combination.includes(elem))) {
        combinationReduced = true;
        setShowWalletReduced(true);
        break;
      }
    }

    if (!combinationReduced) {
      setShowWalletReduced(false);
      curWallet.push(combination);
    }
  }

  function addCombinationToWallet(event) {
    reduceWallet(wallet, combinationToAdd);
    setWallet(wallet);
    setCombinationToAdd([]);
  }

  function displayCombinationEditor() {
    let displayCurrentState = "";
    for (let keyIndex of combinationToAdd) {
      displayCurrentState += (keyIndex + 1).toString() + " and ";
    }

    let buttons = [];
    for (let i = 0; i < keyNum; i++) {
      if (!combinationToAdd.includes(i)) {
        buttons.push(<Button variant="light-lavender" style={{ marginRight: '5px' }} onClick={(event) => addToCombination(i)}>{i + 1}</Button>);
      }
    }

    return (<div><div style={{ fontSize: '25px', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px' }}>( {displayCurrentState}   )</div>
      <div style={{ marginBottom: '15px' }}>{buttons}</div></div>)
  }

  let keyProbInputs = [];
  for (let i = 0; i < keyNum; i++) {
    keyProbInputs.push(renderKeyProbInputRow(i));
  }

  let alertProbabilitiesError = <div></div>;
  if (showProbabilitiesError) {
    alertProbabilitiesError = <Alert variant="danger" onClose={() => setShowProbabilitiesError(false)} dismissible>Failure percentages must add up to 100 %</Alert>;
  }

  let alertWalletStrWithErrors = <div></div>;
  if (showWalletStrWithErrors) {
    alertWalletStrWithErrors = <Alert variant="danger" onClose={() => setShowWalletStrWithErrors(false)} dismissible>Could not parse entered wallet. (Try creating a wallet using the key buttons above first to see the correct wallet format)</Alert>
  }

  let alertCantComputeOptimalWallet = <div></div>;
  if (showCantComputeOptimalWallet) {
    alertCantComputeOptimalWallet = <Alert variant="danger" onClose={() => setShowCantComputeOptimalWallet(false)} dismissible>Computing optimal wallet is only available up to 4 keys</Alert>;
  }

  let warnWalletReduced = <div></div>;
  if (showWalletReduced) {
    warnWalletReduced = <Alert variant="warning" onClose={() => setShowWalletReduced(false)} dismissible>The last key combination added caused the wallet to reduced, meaning reduntant key combinations have been removed since they have no effect on wallet security.</Alert>;
  }

  let infoSetKeys = <div></div>;
  if (showSetKeysInfo) {
    infoSetKeys = <Alert style={{ marginTop: '5px' }} variant="info" onClose={() => setShowSetKeysInfo(false)} dismissible>This calculator uses the key configuration of a crypto wallet and is able to compute the wallet's success rate. A wallet is considered successful when the user of the wallet is able to use it and an adversary can't.<br />A wallet is considered a set of different key combinations such that each combination can by itself use the wallet to sign a transaction.<br />Therefore, it is modeled here by an OR operation between different key combinations, such that all keys in a combination are ANDed together, meaning they must all be used together to use the wallet.<br /> <br />First, configure the probabilities of each key state in the below table for each of your keys:</Alert>;
  }

  let infoWalletConfiguration = <div></div>;
  if (showWalletConfigurationInfo) {
    infoWalletConfiguration = <Alert style={{ marginTop: '5px' }} variant="info" onClose={() => setShowWalletConfigurationInfo(false)} dismissible>Now, set combinations of keys that can be used together in order to operate the wallet.<br />Do this by clicking on the keys that are part of the combination and then adding the combination to your wallet. <br /><br />(You may also enter a few combinations together directly as a string in the same syntax of the displayed wallet below)</Alert>;
  }

  let infoWallet = <div></div>;
  if (showWalletInfo) {
    infoWallet = <Alert style={{ marginTop: '5px' }} variant="info" onClose={() => setShowWalletInfo(false)} dismissible>Here the success rate of your wallet is shown.<br />It is also possible to compute the optimal wallet configuration for your given keys (only up to 4 keys).</Alert>;
  }

  let warningMobile = <div></div>;
  if (showWarningMobile) {
    warningMobile = <Alert variant="warning" onClose={() => setShowWarningMobile(false)} dismissible><Alert.Heading>You are viewing this page on mobile!</Alert.Heading> <p>For a better experience view either on desktop or in landscape mode.</p></Alert>;
  }

  document.body.style.backgroundColor = '#DFF0EF';

  let keyConfCard = (<Card style={{ marginTop: '20px' }}>
    <Card.Body>
      <Card.Title style={{ fontSize: '28px' }}>Set Key Probabilities</Card.Title>

      {warningMobile}
      <Alert style={{ marginTop: '5px' }} variant="danger"> This app is provided warranty free such that no liability or responsibility is taken by any party for it or its uses. It was created for academic purposes only and should be treated as such.</Alert>
      {infoSetKeys}

      <style type="text/css">
        {`
      .btn-minty {
        color: #fff;
        background-color: #23A79D;
        border-color: #23A79D;
      }

      .btn-light-lavender {
        color: #fff;
        background-color: #4C579B;
        border-color: #4C579B;
      }

      `}
      </style>
      <Button style={{ marginTop: '15px', marginBottom: '10px' }} size='sm' variant='minty' onClick={toggleEditingMode}>{isEditingProbabilities ? "Submit changes" : "Edit key probabilities"}</Button>
      <Table striped bordered hover responsive id='keyProbabilities'>
        <tbody>
          <tr>{renderTableHeader()}</tr>
          {keyProbInputs}
        </tbody>
      </Table>
      {alertProbabilitiesError}
      <Button size='sm' variant='minty' onClick={addKey}>+</Button>
    </Card.Body>
  </Card>);

  let walletConfCard = (<Card style={{ marginTop: '20px' }}>
    <Card.Body>
      <Card.Title style={{ fontSize: '28px' }}>Set Wallet Configuration</Card.Title>
      {infoWalletConfiguration}

      {displayCombinationEditor()}

      <Button style={{ marginBottom: '5px' }} variant='minty' size='sm' onClick={addCombinationToWallet}>Add combination to wallet</Button><br />
      <Button style={{ marginBottom: '20px' }} variant='minty' size='sm' onClick={() => { setCombinationToAdd([]) }}>Clear combination</Button>

      <Card.Text style={{ fontSize: '25px' }}>(Optional) Enter Wallet as String</Card.Text>
      <Form.Control type="text" size='sm' onChange={(event) => parseWalletFromString(event.target.value)} />
      {alertWalletStrWithErrors}
    </Card.Body>
  </Card>);

  let walletCard = (<Card style={{ marginTop: '20px', marginBottom: '20px', minHeight: 'parent' }}>
    <Card.Body>
      <Card.Title style={{ fontSize: '28px' }}>Wallet</Card.Title>
      {infoWallet}

      <div style={{ fontSize: '25px', fontWeight: 'bold', marginTop: '15px', marginBottom: '10px' }}>{displayWallet(wallet)}</div>
      {warnWalletReduced}
      <Button style={{ marginBottom: '20px' }} variant='minty' size='sm' onClick={() => { setWallet([]) }}>Clear Wallet</Button>

      <div style={{ fontSize: '25px' }}>Wallet Success Probability</div>
      <div style={{ fontSize: '25px', marginBottom: '20px' }}>{toPercent(computeProbabilityForWallet(wallet))}</div>

      <div style={{ fontSize: '25px', marginBottom: '10px' }}>Optimal Wallet</div>
      <Button style={{ marginBottom: '10px' }} variant='minty' size='sm' onClick={() => { setOptimalWallet([]); setOptimalWalletProb(0); findOptimalWallet(); }}>Compute optimal wallet</Button>
      {alertCantComputeOptimalWallet}
      <div style={{ fontSize: '25px', fontWeight: 'bold' }}>{displayWallet(optimalWallet)}</div>
      <div style={{ fontSize: '25px' }}>{toPercent(optimalWalletProb)}</div>
    </Card.Body>
  </Card>);

  let cardsContainer = <div></div>;
  if (!isMobile) {
    cardsContainer = <Container fluid>
      <Row style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx }}>
        <Col>{keyConfCard}</Col>
      </Row>
      <Row style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx }}>
        <Col>{walletConfCard}</Col>
        <Col>{walletCard}</Col>
      </Row>
    </Container>;
  }
  else {
    cardsContainer = <Container fluid>
      <Row style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx }}>
        <Col>{keyConfCard}</Col>
      </Row>
      <Row style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx }}>
        <Col>{walletConfCard}</Col>
      </Row>
      <Row style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx }}>
        <Col>{walletCard}</Col>
      </Row>
    </Container>;
  }

  const meta = {
    title: 'Crypto Wallet Key Analyzer',
    description: 'Analyze given a certain crypto wallet key distribution setting, the probability of its failure',
    meta: {
      charset: 'utf-8',
      name: {
        keywords: 'crypto,wallet,keys',
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#DFF0EF', fontFamily: 'AvenirNext-Medium' }}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css"
        integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU"
        crossOrigin="anonymous"
      />

      <MetaTags>
        <title>Crypto Wallet Key Analyzer</title>
        <meta name="description" content="Analyze given a certain crypto wallet key distribution setting, the probability of its failure" />
      </MetaTags>

      <h1 style={{ marginLeft: marginHorizontalPx, marginRight: marginHorizontalPx, marginTop: '20px', textAlign: 'center', color: '#2C2F33' }}>Crypto Wallet Key Analyzer</h1>

      {cardsContainer}

      <p style={{ textAlign: 'right', marginRight: marginHorizontalPx }}>powered by <a href="https://zengo.com/"><img src={ZengoLogo} style={{ height: '6vmin' }} alt="ZenGo" /></a></p>
    </div>
  );
}

export default App;