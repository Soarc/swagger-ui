import win from "core/window"
import { btoa } from "core/utils"

export default function authorize ( { auth, authActions, errActions, configs, authConfigs={} } ) {
  
  let { schema, scopes, name, clientId } = auth
  authActions.authorizeTempPassword(auth);
}
