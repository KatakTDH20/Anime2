 <img v-for="persona in personasAxios" :src="persona.picture.thumbnail" :title="persona.name.first"></img>
                    <span>{{persona.name.title}}. {{persona.name.first}} </span>