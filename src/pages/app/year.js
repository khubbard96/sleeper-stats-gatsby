import * as React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../../components/layout"

const YearPage = props => {
  const data = props.data.allMongodbSleeperWeeks.nodes.filter(
    d => d.year == props.year
  )
  if(!data) return(<div>error</div>);
  const leagueData = props.data.allMongodbSleeperLeagueInfo.nodes.filter(
    d => d.year == props.year
  )[0]
  if(!leagueData) return(<div>error</div>);

  const getTeamWinLossPerWeek = () => {
    const teamToWeekRecords = {}
    data
      .map(d => d.scores)
      .forEach((week, idx) => {
        let totWin = 0,
          totLoss = 0
        Object.keys(week).forEach((thisTeamId, idx) => {
          let wins = 0,
            losses = 0
          Object.keys(week).forEach(thatTeamId => {
            if (thisTeamId != thatTeamId) {
              week[thisTeamId] > week[thatTeamId] ? wins++ : losses++
            }
          })

          if (!teamToWeekRecords[thisTeamId]) {
            teamToWeekRecords[thisTeamId] = []
          }
          teamToWeekRecords[thisTeamId].push({ wins, losses })
        })
      })
    return teamToWeekRecords
  }

  const remapTeamData = () => {
    return Array.from(Array(leagueData.teams.length).keys()).map(teamIdx => {
      return {
        team: teamIdx + 1,
        scores: data
          .map(weekItem => weekItem.scores)
          .map(
            scores => scores.find(score => score.roster == teamIdx + 1).score
          ),
      }
    })
  }

  const weeklyScoresByTeam = remapTeamData().map(
    (teamIdAndScores, idx, teamsScoresData) => {
      return teamIdAndScores.scores
    }
  )

  const weeklyRecordAgainstLeagueByTeam =  weeklyScoresByTeam.map((weekScores, teamIdx) => {
    return (
        weekScores.map((thisScore, weekIdx) => {
          //get other scores in this weekidx

          const otherScoresInWeek =
            //weekly scores, by team
            weeklyScoresByTeam

              //get all other teams scores except this one
              .filter((team, _teamIdx) => teamIdx != _teamIdx)

              //get just this week for all other teams
              .map((team, _teamIdx, arr) => arr[_teamIdx][weekIdx])

          const winLoss = otherScoresInWeek.reduce(
            (acc, otherScore, idx) => {
              if (thisScore > otherScore) {
                return { wins: acc.wins + 1, losses: acc.losses }
              } else {
                return { wins: acc.wins, losses: acc.losses + 1 }
              }
            },
            { wins: 0, losses: 0 }
          )
          return winLoss
        })
    )
  });

  const totalWinLossVersusLeagueByTeam = weeklyRecordAgainstLeagueByTeam.map((teamWeeklyRecords, teamIdx) => {
    const winLoss = teamWeeklyRecords.reduce((acc, currRecord, idx)=>{
        return {
            wins: acc.wins + currRecord.wins,
            losses: acc.losses + currRecord.losses
        }
    },{wins:0,losses:0});
    winLoss["pct"] = (winLoss.wins / (winLoss.wins + winLoss.losses))
    return winLoss;
  });

  const advancedStatsKeys = {wae: "Wins above expected",}

  const advancedStatsByTeam = Array.from(Array(leagueData.teams.length).keys()).map((teamIdx)=>{
    //calculate wins above expected
    const teamData = leagueData.teams.find((t)=>t.roster_id==teamIdx+1)
    const teamRegWins = teamData.wins;
    const totalWinLoss = totalWinLossVersusLeagueByTeam[teamIdx];
    const expectedWins = totalWinLoss.pct * (teamRegWins + teamData.losses);console.log(expectedWins);
    return {
        "wae": teamRegWins - expectedWins
    }
  })



  return (
    <Layout>
      <h1>{props.year}</h1>
      <h5>Weekly scores</h5>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Team</th>
            {data.map(d => {
              return <th scope="col">{d.week}</th>
            })}
            <th>Actual record</th>
          </tr>
        </thead>
        <tbody>
          {
            weeklyScoresByTeam.map((weekScores, teamIdx) => {
              return (
                <tr>
                  <th scope="row">
                    {
                      leagueData.teams.find(team => team.roster_id == teamIdx + 1)
                        .team_name
                    }
                  </th>
                  {weekScores.map((score, weekIdx) => {
                    return <td>{score}</td>
                  })}
                  <td>
                    {leagueData.teams.find((t)=>t.roster_id==teamIdx+1).wins + "-" + leagueData.teams.find((t)=>t.roster_id==teamIdx+1).losses}
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <h5>Weekly record versus league</h5>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Team</th>
            {data.map(d => {
              return <th scope="col">{d.week}</th>
            })}
            <th>Total record</th>
          </tr>
        </thead>
        <tbody>
          {
            weeklyRecordAgainstLeagueByTeam.map((recordEachWeek, teamIdx) => {
              return (
                <tr>
                  <th scope="row">
                    {
                      leagueData.teams.find(
                        team => team.roster_id == teamIdx + 1
                      ).team_name
                    }
                  </th>
                  {recordEachWeek.map((thisRecord, weekIdx) => {
                    return <td>{thisRecord.wins + "-" + thisRecord.losses}</td>
                  })}
                  <td>{totalWinLossVersusLeagueByTeam[teamIdx].wins + "-" + totalWinLossVersusLeagueByTeam[teamIdx].losses + " (" + (totalWinLossVersusLeagueByTeam[teamIdx].pct + "").substring(0,5) + ")"}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <h5>Advanced metrics</h5>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Team</th>
            {Object.entries(advancedStatsKeys).map(([key,value],idx) => {
              return <th scope="col">{value}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {
            advancedStatsByTeam.map((teamAdvStats, teamIdx) => {
              return (
                <tr>
                  <th scope="row">
                    {
                      leagueData.teams.find(
                        team => team.roster_id == teamIdx + 1
                      ).team_name
                    }
                  </th>
                  {Object.entries(teamAdvStats).map(([statKey,statValue], idx) => {
                    return <td>{(statValue+"").substring(0,5)}</td>
                  })
                  }
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </Layout>
  )
}

export default YearPage

export const pageQuery = graphql`
  query {
    allMongodbSleeperWeeks {
      nodes {
        year
        week
        scores {
          score
          roster
          matchup
        }
      }
    }
    allMongodbSleeperLeagueInfo {
      nodes {
        year
        teams {
          team_name
          roster_id
          wins
          losses
        }
      }
    }
  }
`
