import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";

//todo list

//urgent
// - change explanation of how to use text input to a popup
// - big text input box
// - update ttable function that is a wrapper for setTtable to update both text and gui (if needed)
// - upload file to textbox
// - download textbox as file
// - build

//NDFA
// - epsilon transition check box
// - choose multiple states in state transition popup

//animatino
// - input word box
// - animate transitions
// - animate reading each letter

//qol
// - hovering a circle or an arrow shows useful highlights






export function Welcome(){
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

  //dropdown to select state in transition table
  const [selectedState, setSelectedState] = useState("")

  const toggleTransEditor = (char: string, state: string) =>{
    console.log("toggling trans editor", char, state)
    setTransChar(char)
    setTransState(state)
    //set the selected state to what it is in the ttable
    let stateToSelect = tTable[states.indexOf(state)][alphabet.indexOf(char)]
    setSelectedState(stateToSelect)
    setToggleTrans(true)
  }

  //contains an array for each state, which contains a value for each char in alphabet
  const [tTable, setTTable] = useState<string[][]>([[]])

  const testFunction = () =>{
    console.log("test func")
    setToggleTrans( prev => {
      return !prev
    })
  }

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

  const alphaInKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key == "Enter"){
      addCharacter()
    }
  }

  //ttable works
  const addCharacter = () =>{
    if(!aError && aInput.length == 1){
      setAlphabet( (prev) => {
        return [...prev, aInput];
      })

      //update the t table to add a new "_" value to each array
      setTTable( (prev) => prev.map(x => [...x, "_"]))

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
      if(newar[0].length == initialLength){//prevents React strict devmode from removing 2 rows
        newar.forEach(row => {
          row.splice(ind,1)
          })
      }
      console.log("newar", newar)
      return newar
    })

    setAlphabet( (prev) => {
      return prev.filter(c => c != char)
    })

    
  }

  const stateInKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key == "Enter"){
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
      let arr = []
    	for(let i =0; i < alphabet.length; i++){
      	arr.push("_")
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
      return newar
    })

    //splice out the value of isFinal
		setIsFinal( (prev) => {
      let newar = [...prev]
      newar.splice(ind, 1)
      return newar
    })

    setStates( (prev) => {
      let newarr = prev.filter(s => s != st)
			updateSvgWidth(svgHeight, newarr.length)
    	return newarr
    })
  }

  const handleStateSelect = (e: ChangeEvent<HTMLSelectElement>, state: string, char: string) =>{
    //also needs to update the ttable
    tTable[states.indexOf(state)][alphabet.indexOf(char)] = e.target.value
    setSelectedState(e.target.value);
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
  const stateSpacing = 300
  const statePadding = 100
  const stateSize = 30

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


  const generateSVG = () => {
    console.log("generating svg...")
		let width = svgRef.current?.width.baseVal.value
    let height = svgRef.current?.height.baseVal.value
    if(width && height){
			let nodesInCol = Math.ceil((height-(2 * statePadding))/stateSpacing)
      let requiredWidth = (2 * statePadding) + (Math.ceil(states.length / nodesInCol) - 1) * stateSpacing
      console.log("nodes", nodesInCol , "w", requiredWidth)
      setSvgWidth(requiredWidth)
    }else{
      console.warn("not yet rendered the svg -andrew")
    }
    
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
    //TODO calculate the x1 and x2 offsets based on where we are trying to go
    //this way the element can just give coordinates from state to state

    let soy = 0 //starting offset in x direction
    let sox = 0
    let eoy = 0
    let eox = 0

    let loop = false

    //determine relative directions
    let horizontal = x1 == x2 ? 0 : x1 > x2 ? -1 : 1
    let vertical = y1 == y2 ? 0: y1 > y2 ? -1 : 1
	
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
    let thetaR = xdist == 0 ? Math.PI/2 : Math.atan(ydist / xdist)
    let offsetDist = Math.sqrt((xdist/2)**2 + (ydist/2)**2)
    let xoff = 0.5*offsetDist*Math.sin(thetaR)
    let yoff = 0.5*offsetDist*Math.cos(thetaR)
    let upper = x2 == x1 ? y2 > y1 : x2 > x1
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
        <circle cx={ax} cy={ay} r={5} fill="red"/>
        <text
        x={cax}
        y={cay}
        fontFamily="monospace"
        fontSize={20}
        textAnchor="middle"
        dominantBaseline="middle">{charName}</text>
      </g>
    )
  }

  const stateIndexToCoords = (index:number) => {
    let nodesInCol = Math.ceil((svgHeight-(2 * statePadding))/stateSpacing)
    let col = Math.ceil((index+1)/nodesInCol)
    let row = index % nodesInCol
    let x = statePadding + stateSpacing*(col-1);
    let y = statePadding + stateSpacing * (row);
    return {x, y} //returns object with these attr names
  }

  return(
    <main className="flex w-screen h-screen">
      <div id="lefthalf" className="flex flex-col w-1/2 h-full">
          <div className="flex flex-col flex-3 bg-red-100 items-center justify-center text-black">
            <h1 className="text-2xl">Describe the FA:</h1>
            <div id="alphabetwrap">
              <h2 className="text-xl">Alphabet:</h2>
              <div id="alphabetDisplay">{alphabet.map( char => {
                return(
                  <button 
                  onClick={() => removeCharacter(char)}
                  className="text-black solid-black px-4 py-2 cursor-pointer hover:text-red-500 hover:bg-gray-100"
                  title={"remove " + char + " from alphabet"}
                  key={char}>{char}</button>
                )
              })}</div> 
              <div id="alphabetInput">
                  Add Character to alphabet: 
                  <input 
                    type="text" 
                    value={aInput}
                    onChange={(e) => updateAInput(e.target.value)}
                    className="bg-white border-black" 
                    onKeyDown={alphaInKeydown}/>
                  <div id="alphabetError" className="text-red-500 h-2em">{aError}</div>
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
                        <th key={colIndex}>{col}</th>
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
                          >{v}</button></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            
            <div className="flex flex-col flex-grow-1 w-full">
              <div className="flex-grow-1 flex flex-col bg-purple-500 w-full">
                <div id="inputToggles" className="flex w-full gap-2">
                  <button 
                    className="flex bg-red-400 w-30 justify-center hover:cursor-pointer hover:bg-red-600 rounded-t-lg"
                    onClick={() => setInputIsText(false)}>gui input</button>
                  <button 
                  className="flex bg-blue-400 w-30 justify-center hover:cursor-pointer hover:bg-blue-600 rounded-t-lg"
                  onClick={() => setInputIsText(true)}>text input</button>
                </div>
                <div className="flex flex-grow-1 bg-green-100">
                  {inputIsText ?(
                      <div className="flex flex-grow-1 bg-blue-400">
                        <p className="text-black-sm">
                          Instructions: Each line of the text below defines a transition from one state to another on an input read. 
                          The order should be &lt;start state&gt; &lt;character&gt; &lt;end state&gt; For example, if you had states named q1 and q2 and an alphabet character 1
                          Then q1 1 q2 would define a transition from q1 to q2 on reading the character 1. State and character values are assumed based on the input transitions.
                          To signify an epsilon transition use "\e" without quotation marks.</p>
                      </div>
                    )
                  :(
                      <div className="flex flex-grow-1 bg-red-400">
                        gui
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-yellow-100 items-center justify-center text-black">
            Analysis here
            <button 
              className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={() => testFunction()}
            >
              Testing Button
            </button>
          </div>
      </div>
      <div id="righthalf" className="flex flex-col w-1/2 h-full bg-blue-100 text-black p-5">
        <h2>Automata here</h2>
        <button
        className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        onClick={generateSVG}>
          Generate Automata
        </button>
        <div
        id="svgWrapper1"
        className="w-full h-full bg-purple-300 max-w-full max-h-full overflow-auto rounded-lg">
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
            <path d="M 0 100 H 60" stroke="red" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" /> 
             
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
                  if(t === "_"){
                    return (
                      <g></g>
                    )
                  }else{
                    let loc1 = stateIndexToCoords(stateIndex)
                    let loc2 = stateIndexToCoords(states.indexOf(t))
                    return (
                      <SvgTransition 
                      charName={alphabet[alphaIndex]} 
                      x1={loc1.x} 
                      y1={loc1.y} 
                      x2={loc2.x} 
                      y2={loc2.y}/>
                    )
                  }
                })
              })}
            </svg>
          </div>
        </div>
      </div>
      {toggleTrans && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-xl text-center">
              <h2 className="text-black text-xl font-bold">When in state "{transState}" reading "{transChar}" transition to</h2>
              <select
              id="stateDropdown"
              value={selectedState}
              className="text-black w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleStateSelect(e, transState, transChar)}>
                <option value="_">No transition</option>
                {states.map( state => (
                  <option value={state}>{state}</option>
                ))}
              </select>
              <button
              className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={() => setToggleTrans(false)}>
                X
              </button>
            </div>
        </div>
      )}
    </main>
  )
}