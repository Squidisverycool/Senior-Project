import gradio as gr
import tempfile
import os

from src.main import main  # or main_pipeline if you renamed it


def analyze(audio):
    """
    audio: tuple (sample_rate, numpy_array) OR filepath
    We save it to disk and run your pipeline.
    """
    if audio is None:
        return None, None, None

    # Save uploaded audio to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        filepath = f.name

    # Gradio audio can be array or path depending on config
    if isinstance(audio, tuple):
        import soundfile as sf
        sr, y = audio
        sf.write(filepath, y, sr)
    else:
        filepath = audio

    # Run your pipeline
    results = main(filepath)

    # You decide what main() returns:
    # Example:
    # results = {
    #   "resynth_path": "...wav",
    #   "pitch_plot": "...png",
    #   "notes": [...]
    # }

    return (
        results["resynth_path"],
        results["pitch_plot"],
        results["notes"]
    )


demo = gr.Interface(
    fn=analyze,
    inputs=gr.Audio(type="filepath", label="Upload Singing Audio"),
    outputs=[
        gr.Audio(label="Resynthesized Melody"),
        gr.Image(label="Pitch Analysis"),
        gr.JSON(label="Detected Notes")
    ],
    title="Singing Analysis & Training Demo",
    description="Upload a vocal recording and see pitch, rhythm, and note analysis."
)

demo.launch()
