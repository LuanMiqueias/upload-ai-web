import {
	ChangeEvent,
	FormEvent,
	useMemo,
	useRef,
	useState,
	useEffect,
} from "react";

// Icons
import { FileVideo, Upload } from "lucide-react";

// UI
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { convertVideoToAudio } from "@/utils/convertVideoToAudio";
import { VideoService } from "@/services/video-service";

type StatusType =
	| "waiting"
	| "converting"
	| "uploading"
	| "generating"
	| "success";

export const VideoInputForm: React.FC<{
	onVideoUploaded: (videoId: string) => void;
}> = ({ onVideoUploaded }) => {
	const statusTranslate = {
		converting: "Converting video...",
		uploading: "Upload vídeo...",
		generating: "Transcribing...",
		success: "Success",
	};
	const [videoFile, setVideoFile] = useState<null | File>(null);
	const promptInputRef = useRef<HTMLTextAreaElement>(null);
	const videRef = useRef<HTMLVideoElement>(null);
	const [videoFileUrl, setVideoFileUrl] = useState<string>("");
	const [status, setStatus] = useState<StatusType>("waiting");

	const handleFleSelected = (e: ChangeEvent<HTMLInputElement>) => {
		const { files } = e.currentTarget;

		if (!files) {
			return;
		}

		const selectedFile = files[0];
		setVideoFile(selectedFile);
	};

	const previewURL = useMemo(() => {
		if (!videoFile) return null;
		setVideoFileUrl(URL.createObjectURL(videoFile));
	}, [videoFile]);

	useEffect(() => {
		if (status === "success") {
			setTimeout(() => setStatus("waiting"), 1000);
		}
	}, [status]);

	useEffect(() => {
		if (videRef.current) {
			videRef.current?.setAttribute("src", videoFileUrl);
			videRef.current.currentTime = 5;
		}
	}, [videRef.current, videoFileUrl]);

	const handleUploadVideo = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!videoFile) return;
		const prompt = promptInputRef.current?.value || "";
		setStatus("converting");
		const audioFile = await convertVideoToAudio(videoFile);
		if (!audioFile) return;

		const data = new FormData();
		data.append("file", audioFile);
		setStatus("uploading");

		VideoService.uploadVideo({
			formData: data,
		}).then((res) => {
			setStatus("generating");

			VideoService.createTranscription({
				videoId: res.video.id,
				prompt,
			}).then(() => {
				setStatus("success");
				onVideoUploaded(res.video.id);
			});
		});
	};
	return (
		<>
			<form className="space-y-6" onSubmit={handleUploadVideo}>
				<label
					htmlFor="video"
					className="relative border flex rounded-md overflow-hidden aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
				>
					{videoFileUrl ? (
						<video
							ref={videRef}
							className="pointer-events-none inset-0 hover:opacity-60"
						/>
					) : (
						<>
							<FileVideo className="w-4 h-4" />
							Select a video
						</>
					)}
				</label>
				<input
					type="file"
					id="video"
					accept="video/mp4"
					className="sr-only"
					onChange={handleFleSelected}
				/>

				<Separator />

				<div className="space-y-2">
					<Label htmlFor="transcription_prompt">Transcription prompt</Label>
					<Textarea
						ref={promptInputRef}
						id="transcription_prompt"
						className="h-20 leading-relaxed resize-none"
						placeholder="Inclua palavras-chave mencionadas no vídeo separadas por (,)"
					/>
				</div>
				<Button
					data-sucess={status === "success"}
					className="transition-all duration-200 w-full data-[sucess=true]:bg-emerald-600 text-white"
					disabled={status !== "waiting" && status !== "success"}
				>
					{status != "waiting" ? (
						statusTranslate[status]
					) : (
						<>
							Upload video
							<Upload className="w-4 h-4 ml-2" />
						</>
					)}
				</Button>

				<Separator />
			</form>
		</>
	);
};
