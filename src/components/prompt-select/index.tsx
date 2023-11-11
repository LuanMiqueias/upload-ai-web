import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { api } from "@/lib/axios";

type PromptsTypes = {
	id: string;
	title: string;
	template: string;
};
interface IPromptSelect {
	handlePromptSelect: (template: string) => void;
}
export const PromptSelect: React.FC<IPromptSelect> = ({
	handlePromptSelect,
}) => {
	const [prompts, setPrompts] = useState<PromptsTypes[]>([]);

	useEffect(() => {
		api.get("/prompts").then((res) => {
			setPrompts(res?.data);
		});
	}, []);

	const handlePromptSelected = (promptId: string) => {
		const selectedPrompt = prompts?.find((item) => item.id === promptId);
		if (!selectedPrompt) return;

		handlePromptSelect(selectedPrompt?.template);
	};
	return (
		<>
			<Select defaultValue="" onValueChange={handlePromptSelected}>
				<SelectTrigger>
					<SelectValue placeholder="Select a prompt..." />
				</SelectTrigger>
				<SelectContent>
					{prompts?.map((item) => {
						return (
							<SelectItem key={item.id} value={item.id}>
								{item.title}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</>
	);
};
