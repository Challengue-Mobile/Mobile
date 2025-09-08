import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../(tabs)/LoginScreen";
import RegisterScreen from "../(tabs)/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Register" component={RegisterScreen} options={{title:"Criar conta"}}/>
    </Stack.Navigator>
  );
}
