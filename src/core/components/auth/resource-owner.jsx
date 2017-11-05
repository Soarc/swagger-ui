import React from "react"
import PropTypes from "prop-types"
import resourceOwnerAuthorize from "core/resource-owner-authorize"

export default class ResourceOwner extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    getConfigs: PropTypes.any
  }

  constructor(props, context) {
    super(props, context)
    let { name, schema, authorized, authSelectors } = this.props
    let auth = authorized && authorized.get(name)
    let authConfigs = authSelectors.getConfigs() || {}
    let username = auth && auth.get("username") || ""
  
    this.state = {
      appName: authConfigs.appName,
      name: name,
      schema: schema,
      username: username,
      password: ""
    }
  }

  authorize =() => {
    let { authActions, errActions, getConfigs, authSelectors } = this.props
    let configs = getConfigs()
    let authConfigs = authSelectors.getConfigs()
    errActions.clear({authId: name,type: "auth", source: "auth"})
    resourceOwnerAuthorize({auth: this.state, authActions, errActions, configs, authConfigs })
  }
  onInputChange =(e) => {
    let { target : { dataset : { name }, value } } = e
    let state = {
      [name]: value
    }

    this.setState(state)
  }

  logout =(e) => {
    e.preventDefault()
    let { authActions, errActions, name } = this.props

    errActions.clear({authId: name, type: "auth", source: "auth"})
    authActions.logout([ name ])
  }

  render() {
    let { schema, getComponent, authSelectors, errSelectors, name } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Col = getComponent("Col")
    const Button = getComponent("Button")
    const AuthError = getComponent("authError")
    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent( "Markdown" )

    let apiScopes = schema.get("apiScopes")
    let authorizedAuth = authSelectors.authorized().get(name)
    let isAuthorized = !!authorizedAuth
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)
    let isValid = !errors.filter( err => err.get("source") === "validation").size
    let description = schema.get("description")
    return (
      <div>
        <h4>ResourceOwner flow <JumpToPath path={[ "securityDefinitions", name ]} /></h4>
        <h5>Api scopes: <code>{ apiScopes }</code></h5>
        { description && <Markdown source={ schema.get("description") } /> }

        { isAuthorized && <h6>Authorized</h6> }

        { 
            <Row>
              <Row>
                <label htmlFor="res_owner_username">Username:</label>
                {
                  isAuthorized ? <code> { this.state.username } </code>
                    : <Col tablet={10} desktop={10}>
                      <input id="res_owner_username" type="text" data-name="username" onChange={ this.onInputChange }/>
                    </Col>
                }
              </Row>
              {

              }
              <Row>
                <label htmlFor="password">Password:</label>
                {
                  isAuthorized ? <code> ****** </code>
                    : <Col tablet={10} desktop={10}>
                      <input id="password" type="password" data-name="password" onChange={ this.onInputChange }/>
                    </Col>
                }
              </Row>
            </Row>
        }       
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
        <div className="auth-btn-wrapper">
        { isValid &&
          ( isAuthorized ? <Button className="btn modal-btn auth authorize" onClick={ this.logout }>Logout</Button>
        : <Button className="btn modal-btn auth authorize" onClick={ this.authorize }>Authorize</Button>
          )
        }
        </div>

      </div>
    )
  }
}
