import { api } from "@/lib/axios";

export class VideoService {
	public static uploadVideo = async (dto: { formData: FormData }) => {
		const { data } = await api.post<{
			video: {
				id: string;
				name: string;
				path: string;
				transcription: string;
				createdAt: string;
			};
		}>("/videos", dto?.formData);
		return data;
	};

	public static createTranscription = async (dto: {
		videoId: string;
		prompt: string;
	}) => {
		console.log(dto);
		const { data } = await api.post<{
			data: any;
		}>(`/videos/${dto?.videoId}/transcription`, {
			prompt: dto?.prompt,
		});
		return data;
	};
}
