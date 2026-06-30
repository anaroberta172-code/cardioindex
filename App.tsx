import React, { useState, useEffect } from 'react';
import { 
  Activity, HeartPulse, BookOpen, GraduationCap, 
  ArrowRight, Info, AlertTriangle, FileText, 
  ChevronLeft, Calculator, Target, Beaker, CheckCircle2,
  Sparkles, Loader2
} from 'lucide-react';

// --- CONFIGURAÇÕES DE CORES E ESTILO ---
const colors = {
  offwhite: '#FCFCFA',
  blue: '#143B5D',
  terracotta: '#AF6C50',
  sage: '#6F7E69',
  graphite: '#25282B',
};

// --- DADOS MOCKADOS E CONSTANTES ---
const knowledgeData = [
  {
    title: 'O que é o Índice TyG?',
    content: 'O Índice Triglicerídeos-Glicose (TyG) combina os valores de triglicerídeos e glicemia para estimar, de forma indireta, a resistência à insulina e auxiliar na avaliação do risco cardiometabólico.'
  },
  {
    title: 'Fórmula do TyG',
    content: 'TyG = ln [ (Triglicerídeos (mg/dL) × Glicemia de jejum (mg/dL)) / 2 ]'
  },
  {
    title: 'O que é o Índice IAP?',
    content: 'O Índice Aterogênico do Plasma (IAP) é um logaritmo da razão entre triglicerídeos e o HDL-c. Ele reflete o tamanho das partículas de LDL e HDL, sendo um forte preditor do risco de doença cardiovascular e aterosclerose.'
  },
  {
    title: 'Fórmula do IAP',
    content: 'IAP = log10 [ Triglicerídeos (mg/dL) / HDL-c (mg/dL) ]'
  },
  {
    title: '📌 Considerações importantes',
    content: 'Os índices TyG e IAP são ferramentas auxiliares para avaliação do risco cardiometabólico. Seus resultados devem ser interpretados em conjunto com a história clínica, exame físico e outros exames laboratoriais. Eles não substituem a avaliação realizada por um profissional de saúde e não estabelecem diagnóstico de forma isolada.'
  }
];

// --- COMPONENTES AUXILIARES ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  const baseStyle = "px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95";
  const variants = {
    primary: "bg-[#143B5D] text-white hover:bg-[#0f2d47]",
    secondary: "bg-[#AF6C50] text-white hover:bg-[#8e563f]",
    outline: "bg-transparent border-2 border-[#143B5D] text-[#143B5D] hover:bg-[#143B5D] hover:text-white",
    sage: "bg-[#6F7E69] text-white hover:bg-[#5a6655]",
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] border border-gray-100/80 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1' : ''} ${className}`}
  >
    {children}
  </div>
);

const getVibrantColor = (value, type) => {
  if (type === 'tyg') {
    return value < 8.8 ? '#22C55E' : '#EF4444'; 
  } else {
    if (value < 0.10) return '#22C55E'; 
    if (value <= 0.24) return '#FACC15'; 
    return '#EF4444'; 
  }
};

const getBadgeClasses = (value, type) => {
  if (type === 'tyg') {
    return value >= 8.8 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200';
  } else {
    if (value > 0.24) return 'bg-red-100 text-red-700 border border-red-200';
    if (value >= 0.10) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-green-100 text-green-700 border border-green-200';
  }
};

const getIapClassification = (value) => {
  if (value < 0.10) return 'Baixo risco';
  if (value <= 0.24) return 'Risco intermediário';
  return 'Alto risco';
};

const VisualScoreBar = ({ value, min, max, thresholds, type }) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  const gradient = "bg-gradient-to-r from-[#22C55E] via-[#FACC15] via-[#FB923C] to-[#EF4444]"; 
  const indicatorColor = getVibrantColor(value, type);

  return (
    <div className="w-full mt-8 mb-4">
      <div className="relative h-5 rounded-full bg-gray-100 overflow-visible shadow-inner">
        <div className={`absolute top-0 left-0 h-full rounded-full w-full ${gradient} shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]`}></div>
        {thresholds.map((t, i) => {
          const tPerc = ((t - min) / (max - min)) * 100;
          if(tPerc >= 0 && tPerc <= 100) {
            return (<div key={i} className="absolute top-0 h-full w-1 bg-white/70 z-10" style={{ left: `${tPerc}%` }}></div>)
          }
          return null;
        })}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white border-[5px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.25)] z-20 transition-all duration-300 ease-out flex items-center justify-center"
          style={{ left: `calc(${percentage}% - 14px)`, borderColor: indicatorColor }}
        >
          <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ backgroundColor: indicatorColor }}></div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-3 font-semibold px-1">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
};

const SimulationPanel = ({ initialTg, initialHdl }) => {
  const [simTg, setSimTg] = useState(parseFloat(initialTg) || 150);
  const [simHdl, setSimHdl] = useState(parseFloat(initialHdl) || 45);
  const simIap = Math.log10(simTg / simHdl);
  const currentColor = getVibrantColor(simIap, 'iap');
  const sliderClass = `w-full h-2 rounded-full appearance-none bg-gray-200 outline-none cursor-pointer mt-4`;

  return (
    <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#143B5D]/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 border-b border-gray-100 pb-8 relative z-10">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-xl font-bold text-[#143B5D]">IAP Simulado</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${getBadgeClasses(simIap, 'iap')}`}>
                {getIapClassification(simIap)}
              </div>
            </div>
            <div className="text-4xl font-black tracking-tighter text-[#25282B] mb-2 transition-colors duration-300" style={{ color: currentColor }}>
              {simIap.toFixed(2)}
            </div>
            <VisualScoreBar value={simIap} min={-0.2} max={0.6} thresholds={[0.10, 0.24]} type="iap" />
          </div>
          <div className="w-full md:w-1/2 bg-[#FAFAF8] p-5 rounded-2xl border border-gray-100/80 shadow-sm">
            <h4 className="font-bold text-[#143B5D] mb-2 flex items-center gap-2">
              <Info size={18} className="text-[#AF6C50]" />
              Como seu resultado muda
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reduzir os triglicerídeos ou aumentar o HDL-c tende a diminuir o IAP, indicando um perfil lipídico mais favorável.
            </p>
          </div>
        </div>
        <div className="space-y-8 relative z-10">
          <div className="group">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#25282B]">Triglicerídeos</label>
              <span className="font-bold text-[#AF6C50] text-xl bg-[#AF6C50]/10 px-3 py-0.5 rounded-lg w-16 text-center">{simTg}</span>
            </div>
            <input type="range" min="30" max="500" value={simTg} onChange={(e) => setSimTg(parseInt(e.target.value))} className={sliderClass} style={{ accentColor: '#AF6C50' }} />
          </div>
          <div className="group">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#25282B]">HDL-c</label>
              <span className="font-bold text-[#6F7E69] text-xl bg-[#6F7E69]/10 px-3 py-0.5 rounded-lg w-16 text-center">{simHdl}</span>
            </div>
            <input type="range" min="20" max="120" value={simHdl} onChange={(e) => setSimHdl(parseInt(e.target.value))} className={sliderClass} style={{ accentColor: '#6F7E69' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home');
  const [formMode, setFormMode] = useState('all');
  const [formData, setFormData] = useState({ tg: '', gly: '', hdl: '' });
  const [results, setResults] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const calculateResults = (e) => {
    e.preventDefault();
    setAiResponse(null); setAiError(''); setShowSimulation(false);
    const tg = parseFloat(formData.tg);
    const gly = parseFloat(formData.gly);
    const hdl = parseFloat(formData.hdl);
    setResults({
      tyg: (formMode === 'all' || formMode === 'tyg') && tg && gly ? Math.log((tg * gly) / 2) : null,
      iap: (formMode === 'all' || formMode === 'iap') && tg && hdl ? Math.log10(tg / hdl) : null
    });
    setView('result');
  };

  const generateAIInsight = async () => {
    setAiLoading(true); setAiError('');
    const prompt = `Analise este perfil clínico: TyG ${results?.tyg?.toFixed(2)}, IAP ${results?.iap?.toFixed(2)}. Forneça orientações educativas de estilo de vida. Resposta simples em parágrafos.`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar análise.");
    } catch { setAiError('Tente novamente em instantes.'); }
    setAiLoading(false);
  };

  const renderNavbar = () => (
    <nav className="w-full bg-[#FCFCFA]/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-[#143B5D] text-white p-2 rounded-xl"><HeartPulse size={24} /></div>
          <span className="font-bold text-xl text-[#143B5D]">Cardio<span className="text-[#AF6C50]">Index</span></span>
        </div>
        <div className="flex gap-6 font-medium text-[#143B5D]/80">
            {['Início', 'Ferramentas', 'Conhecimento'].map(i => (
                <button key={i} onClick={() => setView(i === 'Início' ? 'home' : i === 'Ferramentas' ? 'tools' : 'knowledge')} className="hover:text-[#AF6C50]">{i}</button>
            ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FCFCFA] text-[#25282B] pb-24">
      {renderNavbar()}
      <main className="max-w-6xl mx-auto px-6 pt-12">
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-6xl font-extrabold text-[#143B5D] mb-6">Transformando dados em conhecimento.</h1>
            <Button onClick={() => setView('tools')}>Gerar Análise <ArrowRight /></Button>
          </div>
        )}
        {view === 'tools' && (
          <div className="grid md:grid-cols-3 gap-8">
              {[ { title: 'Análise Completa', mode: 'all' }, { title: 'Índice TyG', mode: 'tyg' }, { title: 'Índice IAP', mode: 'iap' } ].map(item => (
                  <Card key={item.mode} onClick={() => { setFormMode(item.mode); setView('form'); }}>
                      <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                      <p className="text-gray-500">Calcular {item.title}</p>
                  </Card>
              ))}
          </div>
        )}
        {view === 'form' && (
          <Card className="max-w-xl mx-auto">
              <form onSubmit={calculateResults} className="space-y-4">
                  {['tg', 'gly', 'hdl'].map(f => (
                      (formMode === 'all' || (formMode === 'tyg' && f !== 'hdl') || (formMode === 'iap' && f !== 'gly')) && 
                      <div key={f}>
                          <label className="block text-sm font-bold mb-1">{f.toUpperCase()}</label>
                          <input type="number" required name={f} onChange={handleInputChange} className="w-full bg-[#FAFAF8] border rounded-xl p-4" />
                      </div>
                  ))}
                  <Button type="submit" className="w-full">Gerar Análise</Button>
              </form>
          </Card>
        )}
        {view === 'result' && results && (
            <div className="max-w-3xl mx-auto space-y-8">
                {results.tyg && <Card>
                    <h3 className="font-bold text-[#143B5D]">Índice TyG</h3>
                    <div className="text-4xl font-black my-4">{results.tyg.toFixed(2)}</div>
                    <VisualScoreBar value={results.tyg} min={7.5} max={10.5} thresholds={[8.8]} type="tyg" />
                </Card>}
                {results.iap && <Card>
                    <h3 className="font-bold text-[#143B5D]">Índice IAP</h3>
                    <div className="text-4xl font-black my-4">{results.iap.toFixed(2)}</div>
                    <VisualScoreBar value={results.iap} min={-0.2} max={0.6} thresholds={[0.10, 0.24]} type="iap" />
                    <Button variant="outline" className="mt-4" onClick={() => setShowSimulation(!showSimulation)}>🔬 Simular</Button>
                    {showSimulation && <SimulationPanel initialTg={formData.tg} initialHdl={formData.hdl} />}
                </Card>}
                {aiResponse && <Card>{aiResponse}</Card>}
                {!aiResponse && <Button onClick={generateAIInsight}>✨ Gerar Análise IA</Button>}
            </div>
        )}
        {view === 'knowledge' && (
            <div className="space-y-6 max-w-2xl mx-auto">
                {knowledgeData.map(k => <Card key={k.title}><h3 className="font-bold text-xl text-[#143B5D] mb-2">{k.title}</h3><p>{k.content}</p></Card>)}
            </div>
        )}
      </main>
      <footer className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t text-center text-sm text-gray-500">
        Os cálculos e interpretações apresentados pelo CardioIndex são baseados em literatura científica. A seção completa de evidências e referências será disponibilizada em versões futuras da plataforma.
      </footer>
    </div>
  );
}