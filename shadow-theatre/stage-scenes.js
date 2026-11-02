// Original extra rehearsal lines: five scenes, three short lines in each.
const extra={
race:[
['乌龟','跑得慢，也可以试试。','Pǎo de màn, yě kěyǐ shìshi.','Ook als je traag bent, kan je het proberen.','You can try even if you are slow.','On peut essayer même si on est lent.'],
['兔子','我要先到终点！','Wǒ yào xiān dào zhōngdiǎn!','Ik wil als eerste aan de finish zijn!','I want to reach the finish first!','Je veux arriver en premier !'],
['乌龟','我不会停下来。','Wǒ bù huì tíng xiàlái.','Ik blijf doorgaan.','I will keep going.','Je vais continuer.'],
['乌龟','终点就在前面。','Zhōngdiǎn jiù zài qiánmiàn.','De finish is vlakbij.','The finish is just ahead.','L’arrivée est tout près.'],
['兔子','下次我要跑到最后。','Xià cì wǒ yào pǎo dào zuìhòu.','Volgende keer loop ik door tot het einde.','Next time I will run all the way.','La prochaine fois, je courrai jusqu’au bout.']],
crow:[
['狐狸','好香啊！','Hǎo xiāng a!','Dat ruikt lekker!','That smells delicious!','Ça sent bon !'],
['旁白','乌鸦低头看着狐狸。','Wūyā dītóu kànzhe húli.','De kraai kijkt naar de vos beneden.','The crow looks down at the fox.','Le corbeau regarde le renard en bas.'],
['旁白','她忘了嘴里的肉。','Tā wàng le zuǐ lǐ de ròu.','Ze vergeet het vlees in haar bek.','She forgets the meat in her beak.','Il oublie la viande dans son bec.'],
['旁白','肉掉到地上了。','Ròu diào dào dì shàng le.','Het vlees valt op de grond.','The meat falls to the ground.','La viande tombe par terre.'],
['乌鸦','下次我要先想一想。','Xià cì wǒ yào xiān xiǎng yi xiǎng.','Volgende keer denk ik eerst na.','Next time I will think first.','La prochaine fois, je réfléchirai d’abord.']],
farmer:[
['农夫','种子需要水。','Zhǒngzi xūyào shuǐ.','De zaadjes hebben water nodig.','The seeds need water.','Les graines ont besoin d’eau.'],
['兔子','这里很凉快。','Zhèlǐ hěn liángkuai.','Hier is het lekker koel.','It is nice and cool here.','Il fait bon et frais ici.'],
['农夫','你明天还来吗？','Nǐ míngtiān hái lái ma?','Kom je morgen terug?','Will you come back tomorrow?','Reviens-tu demain ?'],
['旁白','田里的草长高了。','Tián lǐ de cǎo zhǎng gāo le.','Het gras op het veld wordt hoger.','The grass in the field grows taller.','L’herbe du champ grandit.'],
['旁白','农夫又开始工作了。','Nóngfū yòu kāishǐ gōngzuò le.','De boer gaat weer aan het werk.','The farmer starts working again.','Le fermier se remet au travail.']],
fox:[
['老虎','你要去哪里？','Nǐ yào qù nǎlǐ?','Waar ga je naartoe?','Where are you going?','Où vas-tu ?'],
['狐狸','不信，就去看看。','Bù xìn, jiù qù kànkan.','Geloof je me niet? Kom dan kijken.','Do not believe me? Come and see.','Tu ne me crois pas ? Viens voir.'],
['老虎','好，我跟着你。','Hǎo, wǒ gēnzhe nǐ.','Goed, ik volg je.','All right, I will follow you.','D’accord, je te suis.'],
['老虎','他们都跑了！','Tāmen dōu pǎo le!','Ze zijn allemaal weggelopen!','They have all run away!','Ils se sont tous enfuis !'],
['老虎','原来是这样！','Yuánlái shì zhèyàng!','Aha, zo zit het dus!','Oh, now I understand!','Ah, je comprends maintenant !']],
nezha:[
['哪吒','这里真漂亮！','Zhèlǐ zhēn piàoliang!','Wat is het hier mooi!','It is beautiful here!','Comme c’est beau ici !'],
['哪吒','别怕，我来帮忙。','Bié pà, wǒ lái bāngmáng.','Wees niet bang. Ik kom helpen.','Do not be afraid. I will help.','N’ayez pas peur. Je vais aider.'],
['龙王','哪吒，发生什么事了？','Nézhā, fāshēng shénme shì le?','Nezha, wat is er gebeurd?','Nezha, what happened?','Nezha, que s’est-il passé ?'],
['哪吒','我们让海浪小一点吧。','Wǒmen ràng hǎilàng xiǎo yīdiǎn ba.','Laten we de golven kleiner maken.','Let us make the waves smaller.','Faisons diminuer les vagues.'],
['龙王','大家一起保护大海。','Dàjiā yīqǐ bǎohù dàhǎi.','Samen zorgen we voor de zee.','Let us look after the sea together.','Prenons soin de la mer ensemble.']]
};
export const sceneNames={race:['森林里的相遇','比赛开始了','快与慢','悄悄向前走','谁到终点了'],crow:['树上的肉','狐狸的夸奖','你会唱歌吗','张开嘴巴','重新想一想'],farmer:['田里的工作','兔子来休息','一次偶然相遇','等啊等','重新开始工作'],fox:['森林里相遇','狐狸的主意','跟我走','动物们跑了','到底怕谁'],nezha:['来到海边','海浪变大了','龙王来了','一起想办法','保护大海']};
export const scenePhotos={race:[3,3,5,7,8],crow:[0,2,5,7,8],farmer:[0,2,4,6,9],fox:[0,2,4,6,8],nezha:[0,2,4,7,8]};
export function expandScenes(scripts,translations){
 for(const [id,lines] of Object.entries(extra)){
  const original=scripts[id].lines;
  scripts[id].lines=lines.flatMap((x,i)=>{
   const [role,zh,py,nl,en,fr]=x;translations[nl]=[en,fr];
   return [...original.slice(i*2,i*2+2),{role,zh,py,nl,action:i===4?'面向观众，停一停。':'看着对方，用动作回应。',actionNl:i===4?'Kijk naar het publiek en wacht even.':'Kijk naar de ander en antwoord met een beweging.'}];
  });
 }
 translations['Kijk naar het publiek en wacht even.']=['Face the audience and pause.','Tourne-toi vers le public et marque une pause.'];
 translations['Kijk naar de ander en antwoord met een beweging.']=['Look at the other character and respond with a movement.','Regarde l’autre personnage et réponds par un geste.'];
}
