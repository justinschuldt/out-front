import React from 'react'
import { Link } from "react-router-dom";
import { Button, Icon } from 'antd'


const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-row" style={{ marginTop: '2em' }} >
          <h1>out-front</h1>
        </div>
        <div className="landing-row">
          <h2>a last ditch effort</h2>
        </div>
        <div className="landing-row" style={{ marginTop: '1em' }}>
          <h4>choose a token</h4>
        </div>
        <div className="landing-row">
          <Link to="/ETH">
            <Button className="landing-button">
              ETH{` `}<Icon type="right" />
            </Button>
          </Link>
        </div>
        <div className="landing-row">
          <Link to="/WETH">
            <Button className="landing-button">
              WETH{` `}<Icon type="right" />
            </Button>
          </Link>
        </div>
        <div className="landing-row">
          <div className="landing-row">
            <Link to="/DAI">
              <Button className="landing-button">
                DAI{` `}<Icon type="right" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LandingPage
