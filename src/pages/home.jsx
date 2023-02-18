import * as React from "react";
import { useState } from "react";
import { startCase } from "lodash";
import { intervalToDuration } from "date-fns";
import { RoundTimer } from "../components/roundTimer";

export default function Home() {
  const classes = {
    "physical": {
      hitPointModifier: 0,
      damageModifier: 2,
      armourModifier: 2,
      icon: "https://cdn.glitch.global/0dd1f9e8-5f95-4760-ad67-93906c54fa55/DPS_Icon_1.png?v=1669718259900"
    },
    "caster": {
      hitPointModifier: 0,
      damageModifier: 2,
      armourModifier: 1,
      icon: "https://cdn.glitch.global/0dd1f9e8-5f95-4760-ad67-93906c54fa55/Magic_Ranged_DPS_Icon_1.png?v=1669718261359"
    },
    "healer": {
      hitPointModifier: 3,
      damageModifier: 0,
      armourModifier: 1,
      icon: "https://cdn.glitch.global/0dd1f9e8-5f95-4760-ad67-93906c54fa55/Healer_Icon_1.png?v=1669718258370"
    },
    "tank": {
      hitPointModifier: 0,
      damageModifier: 0,
      armourModifier: 3,
      icon: "https://cdn.glitch.global/0dd1f9e8-5f95-4760-ad67-93906c54fa55/Tank_Icon_1.png?v=1669718256078"
    }
  };
  
  const [fighterOneName, setFighterOneName] = useState("Fighter One");
  const [fighterTwoName, setFighterTwoName] = useState("Fighter Two");
  const [fighterOneClass, setFighterOneClass] = useState(null);
  const [fighterTwoClass, setFighterTwoClass] = useState(null);
  const [fighterOneLog, setFighterOneLog] = useState([]);
  const [fighterTwoLog, setFighterTwoLog] = useState([]);
  const [currentFighter, setCurrentFighter] = useState(null);
  const [startingFighter, setStartingFighter] = useState(null);
  const [damageRoll, setDamageRoll] = useState("");
  const [fightStarted, setFightStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [fightLength, setFightLength] = useState(30);
  
  const getFightReport = (fighterLog) => {
    if (fighterLog.length > 0) {
      const fightReportList = fighterLog.map((item) => {
        if (item.limit) {
          return (
            <div className="fight-report-damage">
            <div className="fight-report-damage-attack">
              <div>Turn {item.turn}</div>
            </div>
            <div className="fight-report-damage-amount">
              LB
            </div>
          </div>
          );
        }
        
        let damageAmount;
        
        if (item.amount >= 10) {
          damageAmount = item.amount;
        } else if (item.amount > 0) {
          damageAmount = `0${item.amount}`;
        } else {
          damageAmount = "--";
        }
        
        return (
          <div className="fight-report-damage">
            <div className="fight-report-damage-attack">
              Turn {item.turn}
            </div>
            <div className="fight-report-damage-amount">
              {damageAmount}
            </div>
          </div>
        );
      });
      
      return (
        <div className="fight-report-log">
          {fightReportList.reverse()}
        </div>
      );
    }
    
    return (
      <div className="fight-report-log">  
        <em className="no-logs">Awaiting results</em>
      </div>
    ); 
  };
  
  const getFighterHealth = (fighterClass, fighterLog) => {
    if (fighterClass) {
      const hitPointBase = 25;
      const classModifiers = classes[fighterClass];

      let currentHitPoints = hitPointBase + classModifiers.hitPointModifier;
      
      fighterLog.forEach((hit) => {
        if (hit.limit) {
          currentHitPoints = 1;
        }
        
        currentHitPoints -= hit.amount;
      });
      
      return currentHitPoints < 0 ? "00" : currentHitPoints < 10 && currentHitPoints >= 0 ? `0${currentHitPoints}` : currentHitPoints;
    }
    
    
    return "--";
  };

  const getFighterIcon = (fighterClass) => {
    let iconSrc = "https://cdn.glitch.global/0dd1f9e8-5f95-4760-ad67-93906c54fa55/All-Rounder_Icon_1.png?v=1669718432007";
    
    if (fighterClass && classes[fighterClass]) {
      iconSrc = classes[fighterClass].icon;
    }
    
    return (
      <img src={iconSrc} height="64px" width="64px" />
    );
  };
  
  const getFighterPlate = (fighterName, fighterClass, fighterLog, currentlyFighting) => {    
    let plateClass = "fighter-plate";
    
    if (currentlyFighting) {
      plateClass += " fighter-plate-active";
    }
    
    const fighterHealth = getFighterHealth(fighterClass, fighterLog);
    
    if (fighterHealth === "00") {
      plateClass += " fighter-plate-ko";
    }
    
    return (
      <div className={plateClass}>
        <div className="fighter-name">{fighterName}</div>
        <div className="fighter-hp">
          {getFighterIcon(fighterClass)}
          {fighterHealth}
        </div>
      </div>
    );
  };
   
  const getFighterClassButtons = (fighterClass, setFighterClass) => {
    const buttonList = [];
    
    for (const [key, value] of Object.entries(classes)) {
      let buttonClass = "fighterClassButton";
      
      if (fighterClass == key) {
        buttonClass += " fighterClassSelected";
      }
      
      buttonList.push(
        <button className={buttonClass} disabled={fightStarted} onClick={(e) => setFighterClass(key)} title={startCase(key)}>
          <img src={value.icon} height="32px" width="32px" />
        </button>
      );
    }
    
    return (
      <div className="fighter-class-buttons">
        {buttonList}
      </div>
    );
  };
  
  const changeCombatTurn = () => {
    const newFighter = currentFighter === 0 ? 1 : 0;
    
    setCurrentFighter(newFighter);
    
    if (newFighter === startingFighter) {
      const newTurn = currentTurn + 1;
      setCurrentTurn(newTurn);
    }
    
    setDamageRoll("");
  };
  
  const dealFighterDamage = (damageAmount, criticalHit) => {
    if (currentFighter === 0) {
      const fighterLog = fighterTwoLog;
      fighterLog.push({amount: damageAmount, crit: criticalHit, turn: currentTurn});
      setFighterTwoLog(fighterLog);
    } else {
      const fighterLog = fighterOneLog;
      fighterLog.push({amount: damageAmount, crit: criticalHit, turn: currentTurn});
      setFighterOneLog(fighterLog);
    }
    
    changeCombatTurn();
  };
  
  const dealLBDamage = () => {
    if (currentFighter === 0) {
      const fighterLog = fighterTwoLog;
      fighterLog.push({amount: 0, limit: true, turn: currentTurn});
      setFighterTwoLog(fighterLog);
    } else {
      const fighterLog = fighterOneLog;
      fighterLog.push({amount: 0, limit: true, turn: currentTurn});
      setFighterOneLog(fighterLog);
    }
    
    changeCombatTurn();
  };
  
  
  const getDamageButton = (attackHit, damageAmount, criticalHit) => {
    const getFighterName = currentFighter === 0 ? fighterOneName : fighterTwoName;
    const getOpponentName = currentFighter === 0 ? fighterTwoName : fighterOneName;

    if (!attackHit) {
      return (
        <button className="full-button" onClick={(e) => dealFighterDamage(0)}>
          End {getFighterName}'s Turn
        </button>
      );
    }
    
    return (
      <button className="full-button" onClick={(e) => dealFighterDamage(damageAmount, criticalHit)}>
        Apply to {getOpponentName}
      </button>
    );
  };
  
  const getLBButton = () => {
    const getOpponentName = currentFighter === 0 ? fighterTwoName : fighterOneName;

    return (
      <button className="full-button" onClick={dealLBDamage}>
        Weaken {getOpponentName}
      </button>
    );
  };
  
  const damageBreakdown = (damageNumber) => {
    if (!damageNumber) {
      return false;
    }
    
    const damageNumberInt = parseInt(damageNumber);
    
    if (damageNumberInt === 0) {
      return (
        <div className="damage-breakdown">
          <div>
            <div className="damage-hit">Fumble!</div>
          </div>
          {getDamageButton(false, 0, false)}
        </div>
      );
    }
    
    if (damageNumberInt < 300) {
      return (
        <div className="damage-breakdown">
          <div>
            <div className="damage-hit">Miss.</div>
          </div>
          {getDamageButton(false, 0, false)}
        </div>
      );
    }
    
    if (damageNumberInt === 999) {
      const getOpponentName = currentFighter === 0 ? fighterTwoName : fighterOneName;
      
      return (
        <div className="damage-breakdown">
          <div className="limit-break">LIMIT BREAK</div>
          {getLBButton()}
        </div>
      );
    }
    
    const damageSplit = Array.from(damageNumber);
    
    const accuracy = parseInt(damageSplit[0]);
    const damage = parseInt(damageSplit[1] || 0);
    const critical = parseInt(damageSplit[2] || 0);
    
    const attackHit = accuracy >= 3;
    let damageAmount = damage === 0 ? 10 : damage;
    let damageAmountAdjusted = damageAmount;
    const criticalHit = critical === 0 || critical >= 7;
    
    const getFighterClass = currentFighter === 0 ? fighterOneClass : fighterTwoClass;
    const getOpponentClass = currentFighter === 0 ? fighterTwoClass : fighterOneClass;
    
    damageAmountAdjusted = damageAmountAdjusted + classes[getFighterClass].damageModifier;
    
    if (criticalHit) {
      damageAmountAdjusted = damageAmountAdjusted * 2;
    }
    
    damageAmountAdjusted = damageAmountAdjusted - classes[getOpponentClass].armourModifier;
    
    if (damageAmountAdjusted < 0) {
      damageAmountAdjusted = 0;
    }
    
    return (
      <div className="damage-breakdown">
        <div>
          <div className="damage-hit">{attackHit ? criticalHit ? "Critical!" : "Hit!" : "Miss."}</div>
          {attackHit && <div>Deals <strong>{damageAmountAdjusted}</strong> damage:</div>}
          {attackHit && <ul className="damage-list">
            <li>{`${damageAmount} base`} {criticalHit && `(x2)`}</li>
            <li>{`+${classes[getFighterClass].damageModifier} ATK mod`} {criticalHit && `(x2)`}</li>
            <li>{`-${classes[getOpponentClass].armourModifier} DEF mod`}</li>
          </ul>}
        </div>
        {getDamageButton(attackHit, damageAmountAdjusted, criticalHit)}
      </div>
    );
  };
  
  const setFirstFighter = (fighter) => {
    setCurrentFighter(fighter);
    setStartingFighter(fighter);
  };
  
  const startFight = () => {
    setFightStarted(true);
    setCurrentTurn(1);
  };
  
  const resetFight = () => {
    setFightStarted(false);
    setFighterOneName("Fighter One");
    setFighterTwoName("Fighter Two");
    setFighterOneClass("");
    setFighterTwoClass("");
    setFighterOneLog([]);
    setFighterTwoLog([]);
    setDamageRoll("");
    setCurrentTurn(0);
    setCurrentFighter(null);
    setStartingFighter(null);
  };

  return (
    <div className="container">
      <div className="fight-setup">
        <div className="card fighters">
          <div className="title">Match Setup</div>
          <div className="fighter-input">
            <input disabled={fightStarted} placeholder="Fighter one name" onChange={(e) => setFighterOneName(e.target.value)} value={fighterOneName} />
            {getFighterClassButtons(fighterOneClass, setFighterOneClass)}
          </div>
          <div className="fighter-input">
            <input disabled={fightStarted} placeholder="Fighter two name" onChange={(e) => setFighterTwoName(e.target.value)} value={fighterTwoName}  />
            {getFighterClassButtons(fighterTwoClass, setFighterTwoClass)}
          </div>
          <div>
            <div className="subtitle">First turn</div>
            <button className="full-button" disabled={startingFighter == 0 || fightStarted} onClick={(e) => setFirstFighter(0)}>
              {fighterOneName}
            </button>
            <button className="full-button" disabled={startingFighter == 1 || fightStarted} onClick={(e) => setFirstFighter(1)}>
              {fighterTwoName}
            </button>
          </div>
          <div className="fighter-input">
            <div className="subtitle">Fight length (mins)</div>
            <input className="fighter-input" disabled={fightStarted} placeholder="45" onChange={(e) => setFightLength(e.target.value)} type="number" value={fightLength} />
          </div>
          <div>
            <div className="subtitle">Controls</div>
            <button className="full-button" disabled={!fighterOneClass || !fighterTwoClass || startingFighter === null || fightStarted} onClick={startFight}>
              Start Fight
            </button>
            <button className="full-button" onClick={resetFight}>
              Reset Fight
            </button>
          </div>
        </div>
        <div className="card rolls">
          <div className="title">Calculator</div>
          <input disabled={!fightStarted} placeholder="Damage roll" onChange={(e) => setDamageRoll(e.target.value)} value={damageRoll} />
          {damageBreakdown(damageRoll)}
        </div>
      </div>
      <div className="fight-night">
        <div className="card fight-turns">
          <div className="turn">Turn {currentTurn}</div>
          <div className="countdown"><RoundTimer fightStarted={fightStarted} minsStart={fightLength} /></div>
        </div>
        <div className="card fight-report">
          <div className="fighter-report">
            {getFighterPlate(fighterOneName, fighterOneClass, fighterOneLog, currentFighter === 0)}
            {getFightReport(fighterOneLog)}
          </div>
          <div className="fighter-report">
            {getFighterPlate(fighterTwoName, fighterTwoClass, fighterTwoLog, currentFighter === 1)}
            {getFightReport(fighterTwoLog)}
          </div>
        </div>
      </div>
    </div>
  );
}
