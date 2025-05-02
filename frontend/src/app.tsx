import { Route, Routes } from "react-router";
import { Landing } from "./routes/landing";

export const App = () => {
	return (
		<Routes>
			<Route path="/" element={<Landing />} />
		</Routes>
	);
};
