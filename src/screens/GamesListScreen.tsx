import * as React from "react";
import {List, ActivityIndicator, Button, Text, TextInput, Theme, withTheme, Headline} from 'react-native-paper';
import {RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import {Game, JoinInfo, State as GamesListState} from "../redux/reducers/GamesListReducer";
import {connect} from "react-redux";
import GameCard from "../components/GameCard";
import {enterGame, establishGameConnection, fetchGamesList, joinGameServer} from "../redux/actions/GamesListActions";
import {HubConnection} from "@microsoft/signalr";
import {StackNavigationProp} from "@react-navigation/stack";
import {SafeAreaView} from "react-native-safe-area-context";

interface Props extends GamesListState {
    navigation: StackNavigationProp<any>;
    theme: Theme;
    fetchGamesList(): Promise<void>;
    joinGameServer(gameId: number): Promise<JoinInfo>;
    establishGameConnection(gameId: number): Promise<HubConnection>;
    enterGame(gameId: number): Promise<void>;
}

interface State {
    refreshing: boolean;
}

class GamesListScreen extends React.Component<Props, State> {
    readonly state: State = {
        refreshing: false,
    };

    async componentDidMount() {
        await this.props.fetchGamesList();
    }

    handleRefreshGames = async () => {
        this.setState({refreshing: true});
        await this.props.fetchGamesList();
        this.setState({refreshing: false})
    };


    handleGamePress = async (game: Game) => {
        console.log(`Pressed game button! ${game.Name}`);
        this.props.navigation.navigate('GameScreen', {
            gameId: game.Id
        });
    };

    render() {
        const joinedServers = [];
        const unjoinedServers = [];
        if (this.props.Games) {
            for (const game of Object.values(this.props.Games)) {
                if (game.HasRequestingPlayer)
                    joinedServers.push(game);
                else
                    unjoinedServers.push(game);
            }

            return (
                <SafeAreaView style={styles.container}>
                    <Headline style={{alignSelf:"center"}}>Games List</Headline>
                <ScrollView
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing}
                                                onRefresh={this.handleRefreshGames}/>
                            }
                >
                    <List.Section title="Joined Games">
                        {joinedServers.map(game =>
                            <GameCard key={game.Id} game={game} handleGamePress={this.handleGamePress}/>
                        )}
                    </List.Section>
                    <List.Section title="Other Games">
                        {unjoinedServers.map(game =>
                            <GameCard key={game.Id} game={game} handleGamePress={this.handleGamePress}/>
                        )}
                    </List.Section>
                </ScrollView>
                </SafeAreaView>
            );
        }
        else {
            return (<ActivityIndicator animating/>)
        }

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});


const mapStateToProps = (state: any) => {
    return {...state.gamesList};
};

export default withTheme(connect(mapStateToProps, {fetchGamesList, joinGameServer, establishGameConnection, enterGame})(GamesListScreen));