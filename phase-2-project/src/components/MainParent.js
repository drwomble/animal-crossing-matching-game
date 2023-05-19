import React from 'react'
import {useState, useEffect, useId} from "react"
import GameCards from "./GameCards"
import CustomerService from './CustomerService'
import {Switch, Route, Link, useHistory} from 'react-router-dom'
import CardContainer from './CardContainer'
import Card from './Card'
import HighScore from './HighScore'
import MyCollection from './MyCollection'
import Modal from 'react-modal'
Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};





function MainParent(){
  //state for cards ⮯
  const [cards, setCards] = useState([])
  const [home, setHome] = useState(false)
  const [turns, setTurns] = useState(0)
  const [choice1, setChoice1] = useState(null)
  const [choice2, setChoice2] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const cardId = useId()
  const [toggleStart, setToggleStart] = useState(true)
  const [newCard, setNewCard] = useState(null)
  const [userName, setUserName ] =useState('')
  const history = useHistory()
  const [modalIsOpen, setIsOpen] = useState(false);
  const[matches, setMatches]= useState(0)

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }

  //fetch request ⮯
  useEffect(() => {
    fetch('http://localhost:3001/all')
    .then(r => r.json())
    .then(data => setCards(data))
    .then(setShowCards(true))
    .catch(err => console.error(err))
  }, [])
  //randomize ⮯
  const shuffledCards = () =>{
    setToggleStart(value => !value)
    const shuffleCards = cards
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => value)
    const newShuffledCards = shuffleCards.slice(0, 2)
    //duplicate the array ⮯
    const newCardArray = [...newShuffledCards, ...newShuffledCards]
    const reshuffledArray = newCardArray
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => ({...value, uniqueId: cardId}))
    //show front of cards when new game then flip them after a few seconds
    setShowCards(true)
    setTimeout(() => {
      setShowCards(false)
    }, 3000)

    setCards(reshuffledArray)
    setTurns(0)
  }
  //handle users card selection
  const handleChoice = (card) => {
    choice1 ? setChoice2(card) : setChoice1(card)
  }
  //compare the 2 cards
  useEffect(() => {
    if(matches !== 2){
      if (choice1 && choice2){
        setDisabled(true)
        if(choice1.id === choice2.id){
          setCards(prevCards =>{
            return prevCards.map(card => {
              if(card.id === choice1.id){
                return {...card, stat: true}
              }else{
                return card
              }
            })
          })
            resetTurn()
            setMatches(currentMatches => currentMatches + 1)
    }else{
        setTimeout(() => resetTurn(), 2000)
        }
      }
    }else{  
       openModal()
       resetTurn()
  }
  }, [choice1, choice2])
  //reset turns
  const resetTurn = () => {
    setChoice1(null)
    setChoice2(null)
    setTurns(value => value + 1)
    setDisabled(false)
  }

  const handleSubmitNew = (e, submitForm) => {
    e.preventDefault()
    fetch('http://localhost:3001/all', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(submitForm)
    }).then(res => res.json())
    .then(card => {
      setNewCard(card);
  })
}

const calculateScore = ()=>{
  let maxScore = 8
  const extraTurns = turns-16
  if (extraTurns > 0){
  return( maxScore - extraTurns * 0.3)
  }
  return(maxScore)
  }


    const handleSubmit =(e) =>{
  e.preventDefault()
  fetch('http://localhost:3001/highscore', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username: userName, score: calculateScore()})
  })
  .then(res => res.json())
  .then(scoreObj => {
    closeModal()
    history.push("/high-score")})
    }
  //display cards
  const displayCards = cards.map((card, index) => <GameCards
  handleChoice={handleChoice}
  card={card}
  key={index}
  flipped={card === choice1 || card === choice2 || card.stat || showCards}
  disabled={disabled}
  />)
  const handleNoHome = () => {
    setHome(true)
  }

  const handleHome = () => {
    setHome(false)
  }
  
  return (
    <div>
      <div className='header'>
        <Link to={''}>
          <img id='gamename' src='https://upload.wikimedia.org/wikipedia/en/9/9e/Animal_Crossing_Logo.png' />
        </Link>
        <div id='nav-bar'>
          <Link to={``} onClick={handleHome} className='menu'>Main Menu</Link>
          <Link to={`/game`} onClick={handleNoHome} className='menu'>Play Game</Link>
          <Link to={`/collection`} onClick={handleNoHome} className='menu'>My Collection</Link>
          <Link to={`/care`} onClick={handleNoHome} className='menu'> Customer Care </Link>
          <Link to= '/high-scores' onClick={handleNoHome} className="menu">High Score</Link>
        </div >
        <audio controls autoPlay id='player'>
          <source src={`https://acnhapi.com/v1/music/${Math.floor(Math.random()*40)}`} type="audio/mpeg" />
        </audio>
      </div>
      <Link to={`/game`}>
        {home ? null : <img id='homepage' onClick={handleNoHome} src="https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.0/c_scale,w_1200/ncom/software/switch/70010000027619/9989957eae3a6b545194c42fec2071675c34aadacd65e6b33fdfe7b3b6a86c3a"/>}
      </Link>
      <Switch>
        <Route path="/game">
          <div>
            <h1 className='game-header'>Memory Card Game</h1>
            <button onClick={shuffledCards} className='game-header'>
              {toggleStart ? "Start Game" : "New Game"}
            </button>
            <h2 className='game-header'>Turns: {turns}</h2>
            <div className='container'>
              {displayCards}
            </div>
            <Modal
              isOpen={modalIsOpen}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Score Modal"
            >
              <button onClick={closeModal}>close</button>
              <div>Enter Your Name</div>
              <form onSubmit={handleSubmit}>
                <input type="text" onChange={e=>setUserName(e.target.value)}/>
                <button type="submit" >Check Out Scores!</button>
              </form>
            </Modal>

          </div>
        </Route>
        <Route path='/high-score'>
            <HighScore />
        </Route>
        <Route path='/collection'>
          <div className='collection-homepage'>
            <CardContainer collectedCard={cards} cardsHolder={cards}/>
            <MyCollection handleSubmitNew={handleSubmitNew} newCard={newCard}/>
          </div>
        </Route>
        <Route path="/cards/:id">
            <Card />
        </Route>
        <Route path="/high-scores">
          <HighScore />
        </Route>

        <Route path='/care'>
          <CustomerService />
        </Route>
      </Switch>
    </div>
  )
}
export default MainParent
