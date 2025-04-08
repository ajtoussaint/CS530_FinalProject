import React from 'react';
import './App.css';

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";

const EPSILON = "\\e"

function App(){
  const [alphabet, setAlphabet] = useState<string[]>([]);
  const [aInput, setAInput] = useState("");
  const [aError, setAError] = useState("");
  const [inputIsText, setInputIsText] = useState(false)

  const [states, setStates] = useState<string[]>(["S"]);
  const [sInput, setSInput] = useState("");
  const [sError, setSError] = useState("");
  //tracks final states
  const [isFinal, setIsFinal] = useState<boolean[]>([false])

  //related to editing transition table
  const [toggleTrans, setToggleTrans] = useState(false)
  const [transChar, setTransChar] = useState("");
  const [transState, setTransState] = useState(""); 

  //text Input
  const [textInput, setTextInput] = useState("")
  const [tIError, setTIError] = useState<string[]>([]) //error for state input

  //dropdown to select state in transition table
  const [selectedState, setSelectedState] = useState<string[]>([]) //d - this will need to be an array

  const toggleTransEditor = (char: string, state: string) =>{
    console.log("toggling trans editor", char, state)
    setTransChar(char)
    setTransState(state)
    //set the selected state to what it is in the ttable
    let stateToSelect = tTable[states.indexOf(state)][alphabet.indexOf(char)] //d - this will return an array
    setSelectedState(stateToSelect)
    setToggleTrans(true)
  }

  //contains an array for each state, which contains a value for each char in alphabet
  const [tTable, setTTable] = useState<string[][][]>([[]]) //d - 1 more layer of arrays

  const updateAInput = (text: string) =>{
    console.log(text)
    if(text.length > 1){
      console.log("alphabet must be single character")
      setAError("alphabet can only include single characters")
    }else if(text.length > 0 && !(/[a-zA-Z0-9]/.test(text))){
      console.log("alphabet may only include characters a-z, A-Z, 0-9")
      setAError("alphabet may only include characters a-z, A-Z, 0-9")
    }else if(alphabet.indexOf(text) >= 0){
      setAError("character already in alphabet")
    }else{
      console.log("alphabet input updated")
      setAError("")
    }
    setAInput(text);
  }

  const updateSInput = (text: string) => {
    console.log(text)
    if(text.length > 4){
      setSError("4 character max")
    }else if(text.length > 0 && !(/[a-zA-Z0-9]/.test(text))){
      setSError("State names may only include characters a-z, A-Z, 0-9")
    }else if(states.indexOf(text) >= 0){
    	setSError("state is already in use")
    }else{
      console.log("state input updated")
      setSError("")
    }
    setSInput(text);
  }

  const handleInputTypeChange = (isText: boolean) =>{
    if(isText){
			//transalte the tTable to a set of transitions
      let transitions: string[] = []
			tTable.forEach((stranses, si) => { //d -> adjust to tTable being 3xdepth
				stranses.forEach((trans, ai) => {
          trans.forEach(t => {
            let start = states[si]
            let read = alphabet[ai]
            let end = t
            let sfinal = isFinal[si] ? "*" :""
            let efinal = isFinal[states.indexOf(end)] ? "*":""
            if(end !== "_")
              transitions.push(`${sfinal}${start} ${read} ${efinal}${end}`)
            })
        })
      })

      setTextInput(transitions.join("\n"))
    }

		setInputIsText(isText)
  }

  const updateTextInput = (text: string) => {
		console.log("Text input:", text);
    let transArr = text.trim().split("\n");
    transArr = transArr.map(x => x.replace("\r", ""))
    console.log("Trans Arr", transArr);
    let errorArr: string[] = []

    //check that all transitions are the correct format
    const transRe = /^\*?([a-zA-Z0-9]+)\s+(\\?[a-zA-Z0-9]+)\s+\*?([a-zA-Z0-9]+)$/

    //set up values to use for updating alphabet, states, ect
    let tAlphabet: string[] = []
    let tStates: string[] = []
    let tIsFinal: boolean[] = []
    let tTTable: string[][][] = [[]] //d -> 3x depth

    //ignore blank lines
    transArr = transArr.filter(t => t.trim() !== "")

    transArr.forEach((t, index) => {
			//check that t is a pattern match
      if(!transRe.test(t)){
        console.log(t, transRe.test(t))
        errorArr.push(`line ${index+1} does not conform to the proper format: <optional *><state name> <char> <optional *><state name>`)
      }else{
        const matches = t.match(transRe);
        
        if (matches){
          //console.log("matched: ", "1", matches[1], "2", matches[2], "3", matches[3])
          //add to alphabet
          if(tAlphabet.indexOf(matches[2]) < 0){
            tAlphabet.push(matches[2])
            //increase length of each table in tTable
            tTTable = tTTable.map(a => [...a, []]) //d - underscore should be an array
          }
          
          //if either state is not already in the states array push it
          if(tStates.indexOf(matches[1]) < 0){
            tStates.push(matches[1])
            isFinal.push(false)
            //add new standard lenth to t table
            let tarr: string[][] = []
            for(let i =0; i < tAlphabet.length; i++){
              tarr.push([]) //d - underscore should be an array
            }
            tTTable.push(tarr)
          }

          if(tStates.indexOf(matches[3]) < 0){
            tStates.push(matches[3])
            isFinal.push(false)
            //extend all ttable lengths
            let tarr: string[][] = []
            for(let i =0; i < tAlphabet.length; i++){
              tarr.push([]) //d - underscore should be an array
            }
            tTTable.push(tarr)
          }

          //add the transition
          //console.log("state: ", tStates.indexOf(matches[1]), tStates)
          //console.log("alphabet: ", tAlphabet.indexOf(matches[2]), tAlphabet)
          //console.log("table: ", tTTable)
          tTTable[tStates.indexOf(matches[1])][tAlphabet.indexOf(matches[2])].push(matches[3]) //d - if _ replace otherwise push new transition

          if( t[t.indexOf(matches[1]) - 1] === "*"){
            //first state is a final state
						tIsFinal[tStates.indexOf(matches[1])] = true;
          }

          if( t[t.indexOf(matches[3]) - 1] === "*"){
            //first state is a final state
						tIsFinal[tStates.indexOf(matches[3])] = true;
          }

					if(matches[1].length > 4){
						//first state is too long
            errorArr.push(`Starting state on line ${index + 1} is longer than 4 characters`)
          }
          if(matches[2].length > 1 && matches[2] !== EPSILON){
						//first state is too long
            errorArr.push(`Transition character on line ${index + 1} is longer than 1 character`)
          }
          if(matches[3].length > 4){
						//first state is too long
            errorArr.push(`Ending state on line ${index + 1} is longer than 4 characters`)
          }
        }
      }
    })

    //check for "S"
    if(tStates.indexOf("S") < 0){
      errorArr.push("Must use a state named S to signify starting state")
    }

    if(tIsFinal.filter(b => b).length < 1){
      errorArr.push("At least one state must be identified as final by preceding with \"*\"")
    }

    //if there are no errors update the tTable, alphabet, states, and final
    if(errorArr.length < 1){
			console.log("table: ", tTTable);
      setStates(tStates)
      setAlphabet(tAlphabet)
      setIsFinal(tIsFinal)
      setTTable(tTTable)
    }
		setTIError(errorArr)
    setTextInput(text);
  }

  const alphaInKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Enter"){
      addCharacter()
    }
  }

  //ttable works
  const addCharacter = (charToAdd:string = "") =>{
    if(!charToAdd)
      charToAdd = aInput;

    if(!aError && aInput.length === 1){
      setAlphabet( (prev) => {
        return [...prev, charToAdd];
      })

      //update the t table to add a new "_" value to each array
      setTTable( (prev) => prev.map(x => [...x, []]))

      setAInput("");
    }
    
  }

  
  const removeCharacter = (char:string) =>{
    //update the t table to remove the value in each array corresponding to the index of this character
    //get the index
    let ind = alphabet.indexOf(char)
    let initialLength = tTable[0].length

    console.log("removing at ind ", ind)

    setTTable( (prev) => {
      let newar = [...prev]
      console.log("initial newar", newar)
      if(newar[0].length === initialLength){//prevents React strict devmode from removing 2 rows
        newar.forEach(row => {
          row.splice(ind,1)
          })
      }
      console.log("newar", newar)
      return newar
    })

    setAlphabet( (prev) => {
      return prev.filter(c => c !== char)
    })
  }

  const [usingEpsilon, setUsingEpsilon] = useState<boolean>(false)

  const toggleEpsilon = () => {
    console.log("Toggle e from", usingEpsilon)
    if(!usingEpsilon){
      console.log("adding e")
      setAlphabet( (prev) => {
        return [...prev, EPSILON];
      })

      //update the t table to add a new "_" value to each array
      setTTable( (prev) => prev.map(x => [...x, []]))
    }else{
      console.log("remvoing e")
      removeCharacter(EPSILON)
    }
    setUsingEpsilon(p => !p)
  }

  const stateInKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Enter"){
      addState()
    }
  }

  const addState = () =>{
    console.log("state adding")
    if(!sError && sInput.length > 0){
      //console.log(sError, sInput.length)
      setStates( (prev) => {
        let newarr = [...prev,sInput]
				updateSvgWidth(svgHeight, newarr.length)
        return newarr
      })
      setIsFinal((prev) => [...prev, false])
      setSInput("")
      let arr: string[][] = []
    	for(let i =0; i < alphabet.length; i++){
      	arr.push([]) //d _ to [_]
    	}
    	//add new array to the t table
    	setTTable( (prev) => [...prev, arr])
    }
  }

  const removeState = (st:string) =>{
    //remove array from the ttable corresponding to this index
    //find index of the state
    let ind = states.indexOf(st)
    //splice out the value of this from the ttable array
    setTTable( (prev) => {
      let newar = [...prev]
      newar.splice(ind, 1)
      //change any references to the state to _
      console.log("removing state", st)
      newar = newar.map(n1 => {
        return n1.map( n2 => {
          return n2.filter(n => n !== st)
        })
      })
      return newar
    })

    //splice out the value of isFinal
		setIsFinal( (prev) => {
      let newar = [...prev]
      newar.splice(ind, 1)
      return newar
    })

    setStates( (prev) => {
      let newarr = prev.filter(s => s !== st)
			updateSvgWidth(svgHeight, newarr.length)
    	return newarr
    })
  }

  const handleStateSelect = (e: ChangeEvent<HTMLSelectElement>, state: string, char: string, index: number) =>{ //d - pass a value for the index in the lowest level array
    //also needs to update the ttable
    //tTable[states.indexOf(state)][alphabet.indexOf(char)] = e.target.value //d - use setState instead, also consider index
    setTTable( prev => {
      let newar = [...prev]
      newar[states.indexOf(state)][alphabet.indexOf(char)][index] = e.target.value;
      return newar;
    })
    setSelectedState(prev => {
      let newar = [...prev]
      newar[index] = e.target.value
      return newar
    });
  }

  const addTransitionState = (startState: string, onChar:string) => {
    //extend the deepest array in the ttable
    console.log("Adding transition option to ", startState, " on ", onChar)
    const initialLength = tTable[states.indexOf(startState)][alphabet.indexOf(onChar)].length
    setTTable( prev => {
      let newar = [...prev]
      //console.log("Before pusing state: ", newar)
      if(newar[states.indexOf(startState)][alphabet.indexOf(onChar)].length === initialLength){
        newar[states.indexOf(startState)][alphabet.indexOf(onChar)].push(states[0])
      }
      //console.log("After pusing state: ", newar)
      return newar
    })
  }

  const removeTransitionState = (startState: string, onChar:string, index:number) => {
    console.log("Removing transition option", startState, onChar, index)
    const initialLength = tTable[states.indexOf(startState)][alphabet.indexOf(onChar)].length
    setTTable( prev => {
      let newar = [...prev]
      if(newar[states.indexOf(startState)][alphabet.indexOf(onChar)].length === initialLength){
        newar[states.indexOf(startState)][alphabet.indexOf(onChar)].splice(index, 1)
      }
      return newar
    })
  }

  const handleFinalityChange = (i:number) => {
    setIsFinal( (prev) => {
      let newar = [...prev]
      newar[i] = !prev[i]
      return newar
    })
  }

  
  //SVG utils
  const [svgWidth, setSvgWidth] = useState(0)
  const stateSpacing = 200
  const statePadding = 100
  const stateSize = 20

  const svgRef = useRef<SVGSVGElement | null>(null);

  const [svgHeight, setSvgHeight] = useState(0);

	useEffect(() => {
  	if (svgRef.current) {
      let h = svgRef.current.height.baseVal.value
    	setSvgHeight(h);
  	}
	}, []);

  const updateSvgWidth = (h:number, nStates:number) => {
    let nodesInCol = Math.ceil((h-(2 * statePadding))/stateSpacing)
    let requiredWidth = (2 * statePadding) + (Math.ceil(nStates / nodesInCol) - 1) * stateSpacing
    //console.log("nodes", nodesInCol , "w", requiredWidth)
    setSvgWidth(requiredWidth)
  }


  type SvgStateProps = {
    sName: string;
    x: number;
    y: number;
  }

  const SvgState: React.FC<SvgStateProps> = ({
    sName,
    x,
    y,
  }) => {
    return(
      <g>
      	<circle cx={x} cy={y} r={stateSize} stroke="black" strokeWidth="3" fill="white" />
        {isFinal[states.indexOf(sName)] && (<circle cx={x} cy={y} r={stateSize*2/3} stroke="black" strokeWidth="2" fill="none"/>)}
      	<text x={x} y={y} fontSize={20} fill="black" fontFamily="monospace"	textAnchor="middle" dominantBaseline="middle">{sName}</text>
      </g>
    )
  }

  type SvgMarkerProps = {
    state: string;
    isLast: boolean;
  }

  const SvgMarker: React.FC<SvgMarkerProps> = ({
    state,
    isLast,
  }) => {
    let stateIndex = states.indexOf(state);
    const loc = stateIndexToCoords(stateIndex)
    let color = "blue"
    if(isLast){
      color = isFinal[stateIndex] ? "green" : "red"
    }
    return(<circle cx={loc.x} cy={loc.y} r={stateSize*4/3} stroke={color} strokeWidth="10" fill="none" />)
  }

  type SvgTransitionProps = {
    charName: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  const SvgTransition: React.FC<SvgTransitionProps> = ({
    charName,
    x1,
    y1,
    x2,
    y2,
  }) => {
    //calculate the x1 and x2 offsets based on where we are trying to go
    //this way the element can just give coordinates from state to state

    let soy = 0 //starting offset in x direction
    let sox = 0
    let eoy = 0
    let eox = 0

    let hAnchor = "middle"

    let loop = false

    //determine relative directions
    let horizontal = x1 === x2 ? 0 : x1 > x2 ? -1 : 1
    let vertical = y1 === y2 ? 0: y1 > y2 ? -1 : 1
	
    const magnitudes = [0.33, 0.67, 1, 1.1].map(x => x*stateSize)
    switch (`${horizontal} ${vertical}`){
      case "0 0":
        //destination = start
        loop = true
        soy = -magnitudes[3]
      	eox = magnitudes[3]
        break;
      case "0 -1":
        //visually N
        sox = -magnitudes[0]
        soy = -magnitudes[3]
        eox = -magnitudes[0]
        eoy = magnitudes[3]
        hAnchor = "end"
        break;
      case "-1 -1":
        //visually NW
        sox = -magnitudes[2]
        soy = -magnitudes[1]
        eox = magnitudes[1]
        eoy = magnitudes[2]
        break;
      case "1 -1":
      	//visually NE
        sox = magnitudes[1]
        soy = -magnitudes[2]
        eox = -magnitudes[2]
        eoy = magnitudes[1]
        break;

      case "1 0":
        //visually E
        sox = magnitudes[3]
        soy = -magnitudes[0]
        eox = -magnitudes[3]
        eoy = -magnitudes[0]
        break;
      case "-1 0":
        //visually W
        sox = -magnitudes[3]
        soy = magnitudes[0]
        eox = magnitudes[3]
        eoy = magnitudes[0]
        break;
      case "0 1":
        //visually S
        sox = magnitudes[0]
        soy= magnitudes[3]
        eox = magnitudes[0]
        eoy = -magnitudes[3]
        hAnchor = "start"
        break;
      case "-1 1":
        //visually SW
        sox = -magnitudes[1]
        soy = magnitudes[2]
        eox = magnitudes[2]
        eoy = -magnitudes[1]
        break;

      case "1 1":
        //visually SE
        sox = magnitudes[2]
        soy = magnitudes[1]
        eox = -magnitudes[1]
        eoy = -magnitudes[2]
        break;
    }

    x1 += sox;
    x2 += eox;

    y1 += soy;
    y2 += eoy;

    //calculate the anchor point
    let ydist = Math.abs(y2 - y1)
    let xdist = Math.abs(x2 - x1)
    let thetaR = xdist === 0 ? Math.PI/2 : Math.atan(ydist / xdist)
    let offsetDist = Math.sqrt((xdist/2)**2 + (ydist/2)**2)
    let xoff = 0.5*offsetDist*Math.sin(thetaR)
    let yoff = 0.5*offsetDist*Math.cos(thetaR)
    let upper = x2 === x1 ? y2 > y1 : x2 > x1
		let hDir = x2 > x1 ? 1 : -1 //edge case of 0 cancels the term so don't care
    let vDir = y2 > y1 ? 1 : -1
    let hDirOff = vDir 
    let vDirOff = upper ? -1 : 1;

    

    let ax = x1 + xdist/2 * hDir + xoff * hDirOff
    let ay = y1 + ydist/2 * vDir + yoff * vDirOff

    const charOff = 0.7
    let cax = x1 + xdist/2 * hDir + xoff*charOff * hDirOff
    let cay = y1 + ydist/2 * vDir + yoff*charOff * vDirOff
    //        70 + |       0     |+ 60   * -1

    if(loop){
      ax = x1 + 4*stateSize
      ay = y2 - 4*stateSize
      cax = x1 + 2.5*stateSize
      cay = y2 - 2.5*stateSize
    }

    return (
      <g>
        <path d={`M ${x1} ${y1} Q ${ax} ${ay}, ${x2} ${y2}`}
        stroke={"black"} 
        strokeWidth="4" 
        fill="none"
        markerEnd="url(#arrowhead)" />
        {/*<circle cx={ax} cy={ay} r={5} fill="red"/>*/}
        <text
        x={cax}
        y={cay}
        fontFamily="monospace"
        fontSize={20}
        textAnchor={hAnchor}
        dominantBaseline="middle">{charName}</text>
      </g>
    )
  }

  const stateIndexToCoords = (index:number) => {
    let nodesInCol = Math.ceil((svgHeight-(2 * statePadding))/stateSpacing) + 1
    let col = Math.ceil((index+1)/nodesInCol)
    let row = index % nodesInCol
    let x = statePadding + stateSpacing*(col-1);
    let y = statePadding + stateSpacing * (row);
    return {x, y} //returns object with these attr names
  }

  //File upload

  //chatgpt generated function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => {
        if(reader.result){
        	updateTextInput(reader.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert('File format invalid');
    }
  };

  const handleFileDownload = () => {
    const blob = new Blob([textInput], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'FA';
    link.click();
  }

  //ANIMATION

  const [wordInput, setWordInput] = useState("")
  const [wiError, setWIError] = useState("")
  const [point, setPoint] = useState<string[]>([])
  const [mLocations, setMLocations] = useState<string[][]>([])

  const updateWordInput = (s) => {
    let charflag = false
    s.split('').forEach(c => {
      if(alphabet.indexOf(c) < 0)
        charflag=true
    })

    if(charflag)
      setWIError("All characters in word must be in alphabet")
    else
      setWIError("")

    setWordInput(s)
  }

  const loadAnimation = () =>{
    if(wiError)
      return //don't animate if there is an error
    //set pointer at the beginning of the word
    let pArr = ["^"]
    for(let i = 0; i < wordInput.length; i++){
      pArr.push("")
    }
    setPoint(pArr)

    //IF using-e calculate epsilon closure of each state
    let eClosures = [...states].map(x => [x])
    let changed = false
    if(usingEpsilon){
      //add the states reachable by epsilon transition to each states closure
      states.forEach( (state, index) => {
        let ets = tTable[index][alphabet.indexOf(EPSILON)]
        ets.forEach(t => {
          if(eClosures[index].indexOf(t) < 0){
            //if the eClosure does not already include this state...
            eClosures[index].push(t)
          }
        })
      })

      console.log("Directly e reachable: ", eClosures)

      do{
        changed = false
        states.forEach( (s, i) => {
          eClosures[i].forEach( (reachableState, index) => {
            eClosures[states.indexOf(reachableState)].forEach( (st, ind) => {
              if(eClosures[i].indexOf(st) < 0){
                //console.log("Found indirect transition from ", s, " to ", st);
                changed = true
                eClosures[i].push(st);
              }
            })
          })
        })
      }while(changed)
      
      //console.log("Completed eClosure:", eClosures)
    }

    //create dfa transition table of possible locations for each state on a read
      //epsilon closure of each state in the lowest transition array
    let ptTable: string[][][] = []
    states.forEach( (s, si) => {
      let arr: string[][] = []
      alphabet.forEach( (c, ci) => {
        if(c !== EPSILON){
          let reachable = tTable[si][ci]
          let n: string[] = []
          reachable.forEach( (st, index) => {
            n = [...n, ...eClosures[states.indexOf(st)]]
            n = [...new Set(n)]//remvoe duplicates
          })
          arr.push(n)
        }
      })
      ptTable.push(arr)
    })
    
    //console.log("PT: ", ptTable)

    //create array of read locations, begin with epsilon closure of S

    let markerLocations: string[][] = []
    markerLocations.push(eClosures[0])
    wordInput.split("").forEach( (char,index) => {
      let nextLocs: string[] = []
      markerLocations[index].forEach( prevState => {
        nextLocs = [...nextLocs, ...ptTable[states.indexOf(prevState)][alphabet.indexOf(char)]]
      })
      nextLocs = [...new Set(nextLocs)]
      markerLocations.push(nextLocs)
    })

    console.log("ML: ", markerLocations)
    setMLocations(markerLocations)

  }

  const advanceAnimation = () =>{
    setPoint(p => {
      let n = [...p]
      let i = n.indexOf("^")
      if(i+1 !== n.length){
        n[i] = ""
        n[i+1] = "^"
      }
      return n
    })
  }

  const previousAnimation = () => {
    setPoint(p => {
      let n = [...p]
      let i = n.indexOf("^")
      if(i !== 0){
        n[i] = ""
        n[i-1] = "^"
      }
      return n
    })
  }

  return(
    <main className="flex flex-col w-screen h-screen bg-[rgb(56,56,56)]">
      <h1 className='bg-[rgb(56,56,56)] text-4xl text-center text-gray-100'>Finite Automata Generator</h1>
      <h3 className='bg-[rgb(56,56,56)] text-2xl text-center text-gray-100'> by Andrew Toussaint</h3>
      <div id="bodyWrapper" className='flex w-screen grow gap-x-4 p-4 bg-[rgb(56,56,56)]'>
      <div id="lefthalf" className="flex flex-col w-1/2 h-full">
              <div className="flex flex-col basis-5/8 max-h-full bg-[rgb(56,56,56)] w-full text-black overflow-auto">
                <div id="inputToggles" className="flex w-full pl-2 gap-2 bg-[rgb(56,56,56)]">
                  <button 
                    className="flex bg-red-400 w-30 justify-center hover:cursor-pointer hover:bg-red-600 rounded-t-lg"
                    onClick={() => handleInputTypeChange(false)}>gui input</button>
                  <button 
                  className="flex bg-blue-400 w-30 justify-center hover:cursor-pointer hover:bg-blue-600 rounded-t-lg"
                  onClick={() => handleInputTypeChange(true)}>text input</button>
                </div>

                  {inputIsText ?(
                      <div className="flex flex-col grow min-h-0 bg-blue-100 rounded-lg">
                        <p className="text-black-sm px-4 py-2">
                          Instructions: Each line of the text below defines a transition from one state to another on an input read. 
                          The order should be &lt;start state&gt; &lt;character&gt; &lt;end state&gt; For example, if you had states named q1 and q2 and an alphabet character 1
                          Then q1 1 q2 would define a transition from q1 to q2 on reading the character 1. State and character values are assumed based on the input transitions.
                          To signify an epsilon transition use "\e" without quotation marks. To signify a final state precede the state name with "*". The starting state is 
                          required to be named "S". 
                        </p>
                        <div id="uploadWrapper" className="flex justify-center space-between w-full bg-blue-100 p-2">
                    	    <label
											        htmlFor="uploadFile"
											        className="text-sm text-black rounded-lg
											        mr-5 py-1 px-3 border-[1px]
											        font-medium
											        bg-gray-100 text-black
											        hover:cursor-pointer hover:bg-gray-300 cursor-pointer">
											        Upload FA from txt File
                              <input
											      		type="file"
											      		id="uploadFile"
											      		accept=".txt"
											      		name="upload"
											      		className="hidden"  // Hide the original input
											      		onChange={handleFileUpload}
										  					/>
											    </label>
											    

                            <button
                            id="downloadFile"
                            onClick={handleFileDownload}
                            className="text-sm text-black rounded-lg mr-5 py-1 px-3 border-[1px] font-medium bg-gray-100
                            hover:cursor-pointer hover:bg-gray-300">
                              Download FA as txt File
                            </button>
                        </div>
                        <div id="textInputWrapper" className="flex justify-center grow p-2">
                        	<textarea
                        	  className="bg-white w-50 h-full"
                        	  id="textInput"
                        	  value={textInput}
                            onChange={(e) => updateTextInput(e.target.value)}
                        	/>
                          
                        </div>
                        <div id="errorListWrapper">
													<ul id="errorList">
                          {tIError.map(err => (
														<li className="text-red-500">{err}</li>
													))}
                          </ul>
                        </div>
                      </div>
                    )
                  :(
                      <div id="guiInputWrapper" className="flex flex-grow w-full rounded-lg">
                        <div className="flex flex-col flex-1 h-full bg-red-100 items-center justify-center text-black w-full h-full rounded-lg">
                        	<h1 className="text-2xl">Describe the FA:</h1>
                          <div id="alphabetwrap">
              							<h2 className="text-xl">Alphabet:</h2>
              							<div id="alphabetDisplay">
                              {alphabet.filter(x => x !== EPSILON).map( char => {
              						  	return(
               						   		<button 
               						   		onClick={() => removeCharacter(char)}
               						   		className="text-black solid-black px-4 py-2 cursor-pointer hover:text-red-500 hover:bg-gray-100"
               						   		title={"remove " + char + " from alphabet"}
               						  	 	key={char}>{char}</button>
                							)})}
                          	</div> 
              							<div id="alphabetInput">
                  						Add Character to alphabet: 
                  						<input 
                  						  type="text" 
                  						  value={aInput}
                  						  onChange={(e) => updateAInput(e.target.value)}
                  						  className="bg-white border-black" 
                  						  onKeyDown={alphaInKeydown}/>
                  						<div id="alphabetError" className="text-red-500 h-2em">{aError}</div>
                              <div id="eWrapper">
                                <input
                                    type="checkbox"
                                    checked={usingEpsilon}
                                    onChange={() => toggleEpsilon()}
                                    />
                                Use epsilon (&epsilon;) transitions
                              </div>
               						   <button 
                						  className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              						      onClick={() => addCharacter()}
                						  >
                						    Add
                						  </button>
             								</div>
            							</div>
                          <div id="stateWrap">
            							  <h2 className="text-xl">States:</h2>
            							    <div id="statesDisplay">{states.map( st => {
            							      if (st === "S"){
																	return(
            							          <button 
            							          onClick={() => alert("Cannot remove start state")}
            							          className="text-black solid-black px-4 py-2 cursor-pointer"
            							          title={"Cannot remove start state" + st}>{st}</button>
            							        )
            							      }else{
																	return(
            							          <button 
            							          onClick={() => removeState(st)}
            							          className="text-black solid-black px-4 py-2 cursor-pointer hover:text-red-500 hover:bg-gray-100"
            							          title={"remove state " + st}>{st}</button>
            							        )
            							      }
            							    })}</div> 
            							    <div id="stateInput">
            							        Add new state: 
            							        <input 
            							          type="text" 
            							          value={sInput}
            							          onChange={(e) => updateSInput(e.target.value)}
            							          className="bg-white border-black"
            							          onKeyDown={stateInKeydown} />
            							        <div id="stateError" className="text-red-500 h-2em">{sError}</div>
            							        <button 
            							          className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            							          onClick={() => addState()}
            							        >
            							          Add
            							        </button>
            							  </div>
            							</div>
                          <div id="transitionWrap">
           						     <h2 className="text-xl">Transitions:</h2>
           						     <table className="min-w-full table-auto border-collapse border border-gray-300">
           						       <thead>
           						         <tr>
           						           <th className="px-4 py-2">finality</th>
           						           <th className="px-4 py-2">states</th>
           						           {alphabet.map((col, colIndex) => (
           						             <th key={colIndex}>{col === EPSILON ? "ε" : col}</th>
           						           ))}
           						         </tr>
           						       </thead>
           						       <tbody>
           						         {states.map((row, rowIndex) => (
           						           <tr key={rowIndex}>
           						             <td className="text-center"><input
           						             type="checkbox"
           						             checked={isFinal[rowIndex]}
           						             value={row}
           						             onChange={() => handleFinalityChange(rowIndex)}
           						             /></td>
           						             <td className="text-center">{row}</td>
           						             {tTable[rowIndex].map((v, index) => (
           						               <td key={row + "-" + alphabet[index]}><button
           						               onClick={() => toggleTransEditor(alphabet[index], row)}
           						               title="edit"
           						               className="text-black solid-black px-4 py-2 cursor-pointer hover:bg-gray-100"
           						               >{"{" + v.join(", ") + "}"}</button></td>
           						             ))}
           						           </tr>
           						         ))}
           						       </tbody>
           						     </table>
           						 		</div>
                        </div>
                      </div>
                    )
                  }

              </div>
          <div className="flex flex-col basis-1/4 text-gray-100 bg-[rgb(56,56,56)] items-center justify-center text-black">
              <h3 className='text-xl'>Input a word to see transitions:</h3>
              <input 
                type="text" 
                value={wordInput}
                onChange={(e) => updateWordInput(e.target.value)}
                className="my-4 bg-white border-black text-black"/>
              <div id="wordError" className="text-red-500 h-2em">{wiError}</div>
              <button 
                className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                  onClick={() => loadAnimation()}
                >
                  Animate
              </button>
          </div>
      </div>
      <div id="righthalf" className="flex flex-col w-1/2 rounded-lg h-full bg-[rgb(80,124,124)] text-black p-5">
        <div id="wordTable" className='flex px-4 flex-col basis-1/8'>
            <table className=''>
                  <thead className='border border-black'>
                    <tr>
                      <th className="border border-black px-2 py-1">$</th>
                      {wordInput.split("").map((c,i) => (
                        <th key={i} className="border border-black px-2 py-1">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>{point.map( (c,i) => (<th key={i}>{c}</th>))}</tr>
                  </tbody>
            </table>
            <div id="aniButtonWrapper" className='flex justify-around'>
                    <button 
                    className="px-2 py-1 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none"
                    onClick={previousAnimation}
                    >{"<"}</button>
                    <button
                    className="px-2 py-1 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none"
                    onClick={advanceAnimation}
                    >{">"}</button>
            </div>
        </div>
        <h2 className="text-2xl">Automata:</h2>
        <div
        id="svgWrapper1"
        className="w-full h-full bg-red-100 max-w-full max-h-full overflow-auto rounded-lg">
          <div 
          id="svgWrapper2"
          className="flex-col items-center justify-center w-full h-full bg-green-300 max-w-full max-h-full"
          >
            <svg ref={svgRef} style={{ width: `${svgWidth}px` }} className="h-full min-w-full bg-white">
            <defs>
            {/*Arrowhead generated by chatgpt*/}
            <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="2" refY="1.75" orient="auto">
      				<polygon points="0 0, 5 1.75, 0 3.5" fill="black" />
			    	</marker>
  					</defs>
            <path d={`M 0 ${statePadding} H ${statePadding-40}`} stroke="red" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" /> 
             
              {states.map((s, index) => {
								//calculate x and y index
                if(!svgHeight){
                  return(<g></g>)
                }else{
                  const loc = stateIndexToCoords(index)
                  return(
										<SvgState x={loc.x} y={loc.y} sName={s}/>
                  )
                }
              })}

              {tTable.map((transitions, stateIndex) => {
                return transitions.map((t, alphaIndex) => {
                  if(t.length <= 0){
                    return (
                      <g></g>
                    )
                  }else{
                    return t.map(trans => {
                      //trans is dest state
                      //stateIndex is original state
                      //alphaIndex is char we are on

                      let charList: string[] = []
                      let cancelFlag: boolean = false
                      charList.push(alphabet[alphaIndex] === EPSILON ? "ε" : alphabet[alphaIndex])
                      
                      tTable[stateIndex].forEach( (tSet, aIndex) => {
                        if(aIndex < alphaIndex){
                          if(tSet.indexOf(trans) >= 0)
                            cancelFlag=true//this arrow has already been created so doesn't matter
                        }else if(aIndex > alphaIndex){
                          if(tSet.indexOf(trans) >= 0)
                            charList.push(alphabet[aIndex] === EPSILON ? "ε" : alphabet[aIndex])
                        }
                      })

                      if(cancelFlag)
                        return(<g></g>)
                    
                      let loc1 = stateIndexToCoords(stateIndex)
                      let loc2 = stateIndexToCoords(states.indexOf(trans))
                      return (
                        <SvgTransition 
                        charName={charList.join(",")} 
                        x1={loc1.x} 
                        y1={loc1.y} 
                        x2={loc2.x} 
                        y2={loc2.y}/>
                      )
                    })
                  }
                })
              })}

              {mLocations.length > 0 && mLocations[point.indexOf("^")].map( (cState, mIndex) => {
                return(
                  <SvgMarker
                  state={cState}
                  isLast={point.indexOf("^") === point.length - 1}/>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
      {toggleTrans && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-xl text-center">
              <h2 className="text-black text-xl font-bold">When in state "{transState}" reading "{transChar}" transition to</h2>
              {/*delta - map the tTable lowest level array to several dropdowns, include an add button*/}
              {tTable[states.indexOf(transState)][alphabet.indexOf(transChar)].map( (trans,i) => {
                return(
                  <div id="transitionOptionWrapper" className='flex'>
                    <select
                    id="stateDropdown"
                    value={selectedState[i]}
                    className="text-black w-full my-4 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => handleStateSelect(e, transState, transChar, i)}>
                      {states.map( state => (
                        <option value={state}>{state}</option>
                      ))}
                    </select>
                    <button
                    title="remove"
                    className="px-4 py-2 my-4 mx-2 bg-red-300 text-black font-semibold rounded-lg shadow-md hover:bg-red-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                    onClick={() => removeTransitionState(transState, transChar, i)}>
                      X
                    </button>
                  </div>
                )
              })}
              <button
              className="px-4 py-2 my-4 bg-green-300 text-black font-semibold rounded-lg shadow-md hover:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={() => addTransitionState(transState, transChar)}>
                +Add Transition
              </button>
              <button
              className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={() => setToggleTrans(false)}>
                X
              </button>
            </div>
        </div>
      )}
      </div>
    </main>
  )
}

export default App
