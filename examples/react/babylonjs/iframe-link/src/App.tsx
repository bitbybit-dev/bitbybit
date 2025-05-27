import React from 'react';
import './App.css';

function App() {

    return (
        <div className="App">
            <h1>YOUR WEBSITE</h1>
            <h2>Example of an IFRAME embeds to bitbybit.dev preview of scripts</h2>
            <iframe
                title="plane"
                src="https://bitbybit.dev/app/bitbybit/lBERTBnmvOz6Pr1PoKXW/KXvDQrBFqlmCSlxBvmq7/preview"
                frameBorder="0">
            </iframe>
            <iframe
                title="helmet"
                src="https://bitbybit.dev/app/bitbybit/ZggYngpuD5uYq9en9mog/OlHDOEP3MBYSNOuDUdXt/preview"
                frameBorder="0">
            </iframe>
            <p>
                <a rel="noreferrer" href="https://bitbybit.dev/app/bitbybit/lBERTBnmvOz6Pr1PoKXW/KXvDQrBFqlmCSlxBvmq7/preview" target="_blank">Link to an IFrame 1 preview</a>
                <a rel="noreferrer" href="https://bitbybit.dev/app/bitbybit/lBERTBnmvOz6Pr1PoKXW/KXvDQrBFqlmCSlxBvmq7" target="_blank">Link to an IFrame 1 script</a>
            </p>
            <p>
                <a rel="noreferrer" href="https://bitbybit.dev/app/bitbybit/ZggYngpuD5uYq9en9mog/OlHDOEP3MBYSNOuDUdXt/preview" target="_blank">Link to an IFrame 2 preview</a>
                <a rel="noreferrer" href="https://bitbybit.dev/app/bitbybit/ZggYngpuD5uYq9en9mog/OlHDOEP3MBYSNOuDUdXt" target="_blank">Link to an IFrame 2 script</a>
            </p>
            <p>
                Other content of your website
            </p>
        </div>
    );
}

export default App;
