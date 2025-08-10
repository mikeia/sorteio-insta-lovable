import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  number: number;
  name: string;
  id: string;
}

interface Winner extends Participant {
  drawnAt: Date;
  position: number;
}

const GiveawayDraw = () => {
  const [participantText, setParticipantText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [originalParticipants, setOriginalParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const parseParticipants = useCallback((text: string): Participant[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed: Participant[] = [];
    
    for (const line of lines) {
      const match = line.trim().match(/^(\d+)\s*-\s*(.+)$/);
      if (match) {
        const [, numberStr, name] = match;
        const number = parseInt(numberStr, 10);
        if (!isNaN(number) && name.trim()) {
          parsed.push({
            number,
            name: name.trim(),
            id: `${number}-${name.trim().replace(/\s+/g, '-').toLowerCase()}`
          });
        }
      }
    }
    
    return parsed;
  }, []);

  const handleParticipantsSubmit = useCallback(() => {
    const parsed = parseParticipants(participantText);
    
    if (parsed.length === 0) {
      toast({
        title: "Invalid Format",
        description: "Please enter participants in the format: number - name (e.g., 1 - John Doe)",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate numbers
    const numbers = parsed.map(p => p.number);
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Numbers",
        description: `Found duplicate participant numbers: ${[...new Set(duplicates)].join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setParticipants(parsed);
    setOriginalParticipants(parsed);
    setWinners([]);
    setCurrentWinner(null);
    
    toast({
      title: "Participants Loaded",
      description: `Successfully loaded ${parsed.length} participants`
    });
  }, [participantText, parseParticipants, toast]);

  const drawWinner = useCallback(() => {
    if (participants.length === 0) {
      toast({
        title: "No Participants",
        description: "Please add participants before drawing a winner",
        variant: "destructive"
      });
      return;
    }

    setIsDrawing(true);
    setCurrentWinner(null);

    // Add suspense with timeout
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedParticipant = participants[randomIndex];
      
      const winner: Winner = {
        ...selectedParticipant,
        drawnAt: new Date(),
        position: winners.length + 1
      };

      setCurrentWinner(winner);
      setWinners(prev => [...prev, winner]);
      setParticipants(prev => prev.filter((_, index) => index !== randomIndex));
      setIsDrawing(false);

      toast({
        title: "🎉 Winner Drawn!",
        description: `${winner.name} has been selected!`
      });
    }, 1500);
  }, [participants, winners, toast]);

  const resetDraw = useCallback(() => {
    setParticipants(originalParticipants);
    setWinners([]);
    setCurrentWinner(null);
    
    toast({
      title: "Draw Reset",
      description: "All participants have been restored"
    });
  }, [originalParticipants, toast]);

  const clearAll = useCallback(() => {
    setParticipantText('');
    setParticipants([]);
    setOriginalParticipants([]);
    setWinners([]);
    setCurrentWinner(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Sorteio Insta
          </h1>
          <p className="text-xl text-muted-foreground">
            Informe a lista de participantes para o sorteio
          </p>
        </div>

        {/* Participants Input */}
        {participants.length === 0 && (
          <Card className="p-6 shadow-elegant">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Adicionar Participantes</h2>
              </div>
              
              <Textarea
                value={participantText}
                onChange={(e) => setParticipantText(e.target.value)}
                placeholder="Informe os participantes no formato: numero - nome&#10;Exemplo:&#10; 1 - John Doe&#10;2 - Jane Smith&#10;3 - Bob Wilson"
                className="min-h-[200px] resize-none"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleParticipantsSubmit}
                  variant="default"
                  size="lg"
                  className="flex-1"
                  disabled={!participantText.trim()}
                >
                 Carregar Participantes
                </Button>
                
                <Button 
                  onClick={clearAll}
                  variant="outline"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Draw Section */}
        {participants.length > 0 && (
          <div className="space-y-6">
            {/* Stats & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  {participants.length} participando
                </Badge>
                
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Trophy className="h-4 w-4 mr-2" />
                  {winners.length} vencedor
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={resetDraw}
                  variant="outline"
                  disabled={isDrawing || winners.length === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refazer 
                </Button>
                
                <Button
                  onClick={clearAll}
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            </div>

            {/* Draw Button */}
            <div className="text-center">
              <Button
                onClick={drawWinner}
                disabled={isDrawing || participants.length === 0}
                size="lg"
                className={`
                  text-2xl px-12 py-6 h-auto font-bold
                  ${isDrawing ? 'animate-pulse-glow' : 'shadow-glow hover:shadow-glow'}
                  transition-all duration-300
                `}
              >
                {isDrawing ? 'Carregando Vencedor...' : 'Mostrar Vencedor'}
              </Button>
            </div>

            {/* Current Winner Display */}
            {currentWinner && (
              <Card className="p-8 bg-gradient-winner shadow-winner animate-winner-reveal">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-winner-foreground">
                    <Trophy className="h-8 w-8" />
                    <h2 className="text-3xl font-bold">Vencedor(a) #{currentWinner.position}</h2>
                  </div>
                  
                  <div className="space-y-2 text-winner-foreground">
                    <div className="text-6xl font-bold">#{currentWinner.number}</div>
                    <div className="text-3xl font-semibold">{currentWinner.name}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Winners History */}
        {winners.length > 0 && (
          <Card className="p-6 shadow-elegant">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Historico de Vencedores
              </h3>
              
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {winners.map((winner, index) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg animate-bounce-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{winner.position}</Badge>
                      <div>
                        <div className="font-semibold">#{winner.number} - {winner.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {winner.drawnAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <Trophy className="h-5 w-5 text-accent" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GiveawayDraw;
