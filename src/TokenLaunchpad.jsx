import React from 'react'
import "./App.scss"
export default function TokenLaunchpad() {
    return  <div 
    className='TokenLaunchpad'>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name'></input> <br />
        <input className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button className='btn'>Create a token</button>
    </div>
}
