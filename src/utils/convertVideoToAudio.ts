import { getFFmpeg } from "@/lib/ffmeg";
import { fetchFile } from "@ffmpeg/util";

export const convertVideoToAudio = async (video: File) => {
	console.log("Convert started.");

	const ffmpeg = await getFFmpeg();
	if (ffmpeg) {
		await ffmpeg?.writeFile("input.mp4", await fetchFile(video));

		ffmpeg?.on("progress", (progress) => {
			console.log("Convert progress: " + Math.round(progress.progress * 100));
		});

		await ffmpeg.exec([
			"-i",
			"input.mp4",
			"-map",
			"0:a",
			"-b:a",
			"20k",
			"-acodec",
			"libmp3lame",
			"output.mp3",
		]);

		const data = await ffmpeg?.readFile("output.mp3");
		const audioFileBlob = data && new Blob([data], { type: "audio/mpeg" });
		const audioFile =
			audioFileBlob &&
			new File([audioFileBlob], "audio.mp3", {
				type: "audio/mpeg",
			});

		console.log("convert finished.");

		return audioFile;
	}
};
