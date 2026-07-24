import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Condições de uso do TreinoFácil, incluindo o aviso de saúde e limitações de responsabilidade.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-lg font-bold tracking-tight">{children}</h2>;
}

export default function TermosPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="text-muted-foreground">
        Última atualização: {LEGAL.lastUpdated}
      </p>

      <div className="border-destructive/40 bg-destructive/10 mt-4 rounded-2xl border p-4">
        <p className="font-semibold">Aviso de saúde — leia antes de treinar</p>
        <p className="mt-2">
          O TreinoFácil é um app de <strong>organização de treinos</strong>. Ele{" "}
          <strong>não é um serviço médico</strong> e não substitui a avaliação de
          um médico, fisioterapeuta ou profissional de educação física. As fichas
          são geradas automaticamente por regras, a partir do que você informa —
          ninguém avalia você presencialmente.
        </p>
        <p className="mt-2">
          <strong>Consulte um médico antes de iniciar qualquer programa de
          exercícios</strong>, especialmente se você tem condição cardíaca,
          hipertensão, lesão, hérnia de disco, está gestante, em pós-operatório ou
          ficou muito tempo sem atividade física. Interrompa o treino
          imediatamente e procure ajuda se sentir dor no peito, falta de ar,
          tontura, desmaio ou dor articular aguda.
        </p>
      </div>

      <H>1. Aceite</H>
      <p>
        Ao criar uma conta você declara que leu e concorda com estes Termos e com
        a Política de Privacidade, e que tem <strong>16 anos ou mais</strong>.
      </p>

      <H>2. O que o app faz</H>
      <p>
        O TreinoFácil monta uma ficha de treino por meio de regras
        pré-programadas, considerando seu objetivo, nível de experiência, tempo
        disponível, equipamentos e limitações declaradas. Também registra seus
        treinos e acompanha sua evolução.
      </p>

      <H>3. O que o app NÃO faz</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Não emite diagnóstico, tratamento ou prescrição médica.</li>
        <li>Não substitui acompanhamento profissional presencial.</li>
        <li>Não oferece orientação nutricional ou de suplementação.</li>
        <li>
          Não garante resultado específico — ganho de massa, perda de peso ou
          desempenho dependem de fatores individuais fora do controle do app.
        </li>
      </ul>

      <H>4. Uso das limitações físicas</H>
      <p>
        Quando você informa uma limitação, o app tenta substituir exercícios
        comumente contraindicados para aquela condição. Isso é um{" "}
        <strong>filtro automático de segurança, não uma avaliação clínica</strong>:
        ele não conhece seu histórico, exames ou estágio da lesão. A decisão final
        sobre o que é seguro para você é do seu médico ou profissional de saúde.
      </p>

      <H>5. Sua responsabilidade</H>
      <p>
        Você é responsável por fornecer informações verdadeiras, respeitar seus
        limites, executar os exercícios com técnica adequada e interromper
        qualquer movimento que cause dor. O uso do app é por sua conta e risco.
      </p>

      <H>6. Limitação de responsabilidade</H>
      <p>
        Na máxima extensão permitida pela lei, {LEGAL.controller} não se
        responsabiliza por lesões, agravamento de condições preexistentes ou
        outros danos decorrentes da prática de exercícios sugeridos pelo app,
        especialmente quando realizados sem liberação médica ou com execução
        inadequada.
      </p>

      <H>7. Conta e encerramento</H>
      <p>
        Você pode excluir sua conta a qualquer momento. Podemos suspender contas
        que violem estes Termos, tentem burlar a segurança do sistema ou
        prejudiquem outros usuários.
      </p>

      <H>8. Contato</H>
      <p>
        Dúvidas sobre estes Termos: <strong>{LEGAL.contactEmail}</strong>.
      </p>
    </>
  );
}
